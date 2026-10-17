"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { XMarkIcon, PrinterIcon, QrCodeIcon } from "@heroicons/react/24/outline";

interface ProductBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  companyName?: string;
}

export default function ProductBarcodeModal({
  isOpen,
  onClose,
  product,
  companyName = "SalesmanPro Store",
}: ProductBarcodeModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
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

  useEffect(() => {
    if (!isOpen || !product) return;
    
    // Encode product lookup URL or SKU
    const payload = JSON.stringify({
      id: product.id,
      sku: sku,
      name: product.name,
      price: price,
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error("QR Code Generation Error:", err));
  }, [isOpen, product, sku, price]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden">
        {/* Header (hidden in print) */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 print:hidden">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Product Label & Barcode</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 flex flex-col items-center">
          <div
            ref={printRef}
            className="w-full max-w-xs bg-white border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm print:border-none print:shadow-none print:p-0"
          >
            {/* Store / Brand Name */}
            <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-1">
              {companyName}
            </p>

            {/* Product Title */}
            <h4 className="text-base font-extrabold text-gray-900 line-clamp-2 mb-2">
              {product.name}
            </h4>

            {/* QR Code */}
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Product QR Barcode"
                className="w-40 h-40 object-contain my-1"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 animate-pulse">
                Generating QR...
              </div>
            )}

            {/* Price Badge */}
            <div className="mt-2 text-xl font-black text-indigo-600">
              KES {Number(price).toLocaleString()}
            </div>

            {/* SKU & Barcode Text */}
            <p className="text-xs font-mono font-bold text-gray-500 mt-1">
              {sku}
            </p>
          </div>

          <p className="text-[11px] text-gray-400 mt-4 text-center print:hidden">
            Scan with any standard camera, phone or POS barcode scanner to pull up product details.
          </p>
        </div>

        {/* Footer Actions (hidden in print) */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
}
