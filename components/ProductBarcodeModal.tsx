"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import QRCode from "qrcode";
import {
  XMarkIcon,
  PrinterIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  TagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  executeUnifiedPrint,
  NormalizedPrintPayload,
  detectPlatform,
} from "@/lib/printing/unifiedPrintClient";
import toast from "react-hot-toast";

interface ProductBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  companyId?: string;
  companyName?: string;
  currency?: string;
}

type LabelSize = "58x40" | "40x28" | "80x50";

interface LabelFormatOption {
  id: LabelSize;
  name: string;
  description: string;
  widthMm: number;
  heightMm: number;
  paperType: "58mm" | "80mm";
}

const LABEL_FORMATS: LabelFormatOption[] = [
  {
    id: "58x40",
    name: "Standard Shelf (58×40mm)",
    description: "Standard retail shelf tag & product sticker",
    widthMm: 58,
    heightMm: 40,
    paperType: "58mm",
  },
  {
    id: "40x28",
    name: "Compact Sticker (40×28mm)",
    description: "Ideal for small items, cosmetics & accessories",
    widthMm: 40,
    heightMm: 28,
    paperType: "58mm",
  },
  {
    id: "80x50",
    name: "Large Bin Tag (80×50mm)",
    description: "Warehouse bins, electronics & apparel hangtags",
    widthMm: 80,
    heightMm: 50,
    paperType: "80mm",
  },
];

/**
 * Generate a deterministic pseudo Code-128 SVG barcode pattern from SKU
 */
function generateBarcodeSvg(sku: string, width = 200, height = 45): string {
  // Deterministic bar pattern generator based on char codes
  let pattern = "11010010000"; // start code B
  for (let i = 0; i < sku.length; i++) {
    const code = sku.charCodeAt(i);
    // Simple 6-bit bar pattern mapping
    const b = (code * 13 + 7) % 64;
    const bitStr = b.toString(2).padStart(6, "0");
    pattern += bitStr
      .split("")
      .map((c) => (c === "1" ? "11" : "0"))
      .join("");
  }
  pattern += "1100011101011"; // stop code

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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rects}</svg>`;
}

export default function ProductBarcodeModal({
  isOpen,
  onClose,
  product,
  companyId,
  companyName = "SalesmanPro Store",
  currency = "KES",
}: ProductBarcodeModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<LabelSize>("58x40");
  const [copies, setCopies] = useState<number>(1);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [routerConfig, setRouterConfig] = useState<any>(null);
  const [barcodeType, setBarcodeType] = useState<"qr" | "barcode" | "both">("both");
  const printRef = useRef<HTMLDivElement>(null);

  const price =
    product?.sellingPrice ||
    product?.productItem?.sellingPrice ||
    (product as any)?.finalPrice ||
    0;

  const sku =
    product?.sku ||
    product?.productItem?.sku ||
    `SKU-${(product?.id || "ITEM").slice(0, 8).toUpperCase()}`;

  const barcodeSvg = useMemo(() => generateBarcodeSvg(sku), [sku]);

  // Fetch configured printer assignment for BARCODE_LABEL
  useEffect(() => {
    if (!isOpen || !companyId) return;

    let isMounted = true;
    const fetchRouting = async () => {
      try {
        const res = await fetch(`/api/devices/assignments?companyId=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          const route = data?.data?.routingMap?.["BARCODE_LABEL"];
          if (isMounted && route) {
            setRouterConfig(route);
            if (route.copies && route.copies > 1) {
              setCopies(route.copies);
            }
          }
        }
      } catch (e) {
        console.warn("[BarcodeModal] Could not fetch router config:", e);
      }
    };

    fetchRouting();
    return () => {
      isMounted = false;
    };
  }, [isOpen, companyId]);

  // Generate QR Code URL
  useEffect(() => {
    if (!isOpen || !product) return;

    const payload = JSON.stringify({
      id: product.id,
      sku: sku,
      name: product.name,
      price: price,
      store: companyName,
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error("[BarcodeModal] QR error:", err));
  }, [isOpen, product, sku, price, companyName]);

  const activeFormat = useMemo(
    () => LABEL_FORMATS.find((f) => f.id === selectedFormat) || LABEL_FORMATS[0],
    [selectedFormat]
  );

  /**
   * Builds clean, thermal label HTML formatted for sticker label printers
   */
  const buildLabelHtml = () => {
    return `
      <div style="font-family: Arial, sans-serif; width: ${activeFormat.widthMm}mm; padding: 2mm 3mm; box-sizing: border-box; text-align: center; color: #000; background: #fff;">
        <div style="font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #444; margin-bottom: 2px;">
          ${companyName}
        </div>
        <div style="font-size: 11px; font-weight: 800; line-height: 1.2; max-height: 26px; overflow: hidden; margin-bottom: 3px;">
          ${product.name}
        </div>
        
        ${
          barcodeType === "qr" || barcodeType === "both"
            ? `<div style="display: flex; justify-content: center; margin: 2px 0;">
                <img src="${qrUrl}" style="width: 22mm; height: 22mm; object-fit: contain;" />
              </div>`
            : ""
        }

        ${
          barcodeType === "barcode" || barcodeType === "both"
            ? `<div style="display: flex; justify-content: center; margin: 2px 0;">
                ${barcodeSvg}
              </div>`
            : ""
        }

        <div style="font-family: monospace; font-size: 9px; font-weight: bold; letter-spacing: 1px; margin-top: 1px;">
          ${sku}
        </div>
        
        <div style="font-size: 14px; font-weight: 900; margin-top: 3px; border-top: 1px dashed #000; padding-top: 2px;">
          ${currency} ${Number(price).toLocaleString()}
        </div>
      </div>
    `;
  };

  /**
   * Dispatches print job via unifiedPrintClient across Android, Desktop or Web
   */
  const handlePrint = async () => {
    if (!product) return;
    setIsPrinting(true);

    try {
      const labelHtml = buildLabelHtml();
      const platform = detectPlatform();

      const printPayload: NormalizedPrintPayload = {
        protocolVersion: 1,
        jobId: `label_${sku}_${Date.now()}`,
        actionKey: "BARCODE_LABEL",
        documentType: "BARCODE_LABEL",
        documentId: sku,
        companyId: companyId || "default",
        createdAt: new Date().toISOString(),
        targetPrinterId: routerConfig?.printerId || undefined,
        document: {
          number: sku,
          date: new Date().toISOString(),
          cashierName: "Inventory Manager",
          orderType: "PRODUCT_LABEL",
          items: [
            {
              name: product.name,
              sku: sku,
              quantity: copies,
              price: Number(price),
              total: Number(price) * copies,
            },
          ],
          totals: {
            subtotal: Number(price),
            total: Number(price),
            currency: currency,
          },
          footer: `${companyName} • Product Label`,
        },
      };

      // Loop through copies
      for (let i = 0; i < copies; i++) {
        const copyPayload = {
          ...printPayload,
          jobId: `${printPayload.jobId}_c${i + 1}`,
        };
        await executeUnifiedPrint(copyPayload, labelHtml);
      }

      toast.success(
        `Sent ${copies} label${copies > 1 ? "s" : ""} to ${
          routerConfig?.printerName || "configured printer"
        } (${platform})`
      );
    } catch (err: any) {
      console.error("[BarcodeModal] Print error:", err);
      toast.error(`Print failed: ${err.message || err}`);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Product Label & Barcode
              </h3>
              <p className="text-xs text-zinc-400">Thermal sticker & shelf-edge tag</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Hardware Routing Info Badge */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🏷️</span>
              <div>
                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                  {routerConfig?.printerName ? routerConfig.printerName : "Default Thermal Route"}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {routerConfig?.connectionType
                    ? `${routerConfig.connectionType} • ${routerConfig.paperWidth || "58mm"}`
                    : "Native Cross-Platform Auto Dispatch"}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Active Route
            </span>
          </div>

          {/* Label Preview Card */}
          <div className="flex flex-col items-center">
            <div
              ref={printRef}
              className="bg-white text-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm transition-all"
              style={{
                width: selectedFormat === "80x50" ? "280px" : "220px",
                minHeight: "180px",
              }}
            >
              {/* Store / Brand Name */}
              <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-1">
                {companyName}
              </p>

              {/* Product Title */}
              <h4 className="text-sm font-extrabold text-zinc-900 line-clamp-2 mb-2 leading-tight">
                {product.name}
              </h4>

              {/* Barcode & QR Code Switcher Preview */}
              {(barcodeType === "qr" || barcodeType === "both") && qrUrl && (
                <img
                  src={qrUrl}
                  alt="Product QR Barcode"
                  className="w-24 h-24 object-contain my-1"
                />
              )}

              {(barcodeType === "barcode" || barcodeType === "both") && (
                <div
                  className="my-1.5 overflow-hidden flex justify-center"
                  dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                />
              )}

              {/* SKU & Barcode Text */}
              <p className="text-[11px] font-mono font-bold text-zinc-600 tracking-wider">
                {sku}
              </p>

              {/* Price Badge */}
              <div className="mt-2 text-lg font-black text-indigo-600 border-t border-dashed border-zinc-200 pt-1.5 w-full">
                {currency} {Number(price).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Barcode Type Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Barcode Display Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "both", label: "QR + Barcode" },
                { id: "qr", label: "QR Code Only" },
                { id: "barcode", label: "1D Barcode" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBarcodeType(opt.id as any)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    barcodeType === opt.id
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label Size / Format Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Label Size & Sticker Dimensions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LABEL_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedFormat === fmt.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    {fmt.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                    {fmt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Copies Stepper */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Number of Copies (Stickers to Print)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 p-1">
                <button
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  className="px-3 py-1 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={copies}
                  onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center bg-transparent text-sm font-bold outline-none"
                />
                <button
                  onClick={() => setCopies((c) => c + 1)}
                  className="px-3 py-1 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition"
                >
                  +
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-1.5">
                {[1, 2, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCopies(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      copies === preset
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    {preset}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {isPrinting ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <PrinterIcon className="w-4 h-4" />
            )}
            <span>
              {isPrinting ? "Printing..." : `Print ${copies} Label${copies > 1 ? "s" : ""}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
