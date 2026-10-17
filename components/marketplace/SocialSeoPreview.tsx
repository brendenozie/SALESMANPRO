"use client";

import React, { useState } from "react";
import {
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface SocialSeoPreviewProps {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  companyName?: string;
  storeSlug?: string;
  stock?: number;
}

export default function SocialSeoPreview({
  title,
  description,
  price,
  imageUrl,
  companyName = "My Salesman Store",
  storeSlug = "store",
  stock = 1,
}: SocialSeoPreviewProps) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "facebook" | "google">("whatsapp");

  const cleanTitle = title || "Untitled Product Listing";
  const cleanDescription =
    description?.trim() ||
    "Shop this verified product on Ghuba Marketplace & official store with fast delivery and secure payment.";
  const displayImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
  const formattedPrice = Number(price || 0).toLocaleString();
  const domain = `${storeSlug}.ghuba.ke`;
  const inStock = stock > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
      {/* Header with Tab Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ShareIcon className="w-4 h-4 text-indigo-600" />
            Social & Search Engine Live Preview
          </h4>
          <p className="text-[11px] text-gray-500">
            How this product displays when shared on WhatsApp, Facebook, or discovered on Google.
          </p>
        </div>

        {/* Channels Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "whatsapp"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("facebook")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "facebook"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <span>Facebook / Twitter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("google")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "google"
                ? "bg-gray-900 text-white shadow-sm dark:bg-gray-700"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <GlobeAltIcon className="w-3.5 h-3.5" />
            <span>Google SERP</span>
          </button>
        </div>
      </div>

      {/* 🟢 WHATSAPP RICH LINK CARD PREVIEW */}
      {activeTab === "whatsapp" && (
        <div className="bg-[#EFEAE2] dark:bg-gray-950 p-4 rounded-2xl">
          <div className="max-w-md bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md border border-black/5 mx-auto">
            {/* Image banner */}
            <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
              <img
                src={displayImage}
                alt={cleanTitle}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                KES {formattedPrice}
              </span>
            </div>
            {/* Card Content */}
            <div className="p-3.5 space-y-1">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {domain}
              </p>
              <h5 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                {cleanTitle} • {companyName}
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {cleanDescription}
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                {inStock ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> In Stock ({stock} units)
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-3.5 h-3.5" /> Out of stock
                  </span>
                )}
                <span>•</span>
                <span>Order directly via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 FACEBOOK & TWITTER (OPEN GRAPH) PREVIEW */}
      {activeTab === "facebook" && (
        <div className="bg-gray-100 dark:bg-gray-950 p-4 rounded-2xl">
          <div className="max-w-lg bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 mx-auto">
            <div className="aspect-[1.91/1] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
              <img
                src={displayImage}
                alt={cleanTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                KES {formattedPrice}
              </div>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {domain.toUpperCase()}
              </p>
              <h5 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                {cleanTitle}
              </h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {cleanDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 GOOGLE SEARCH ENGINE RESULTS (SERP) PREVIEW */}
      {activeTab === "google" && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="max-w-lg space-y-1.5 font-sans">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                G
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold leading-none">{companyName}</span>
                <span className="text-[10px] text-gray-400">
                  https://{domain} › products › {cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                </span>
              </div>
            </div>

            {/* Clickable Blue Title */}
            <h5 className="text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
              {cleanTitle} | Buy Online at Best Price in Kenya
            </h5>

            {/* Price & Stock Rich Snippet */}
            <div className="text-xs flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
              <span className="font-bold text-gray-900 dark:text-gray-200">
                KES {formattedPrice}.00
              </span>
              <span>•</span>
              <span className={inStock ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                {inStock ? `In stock (${stock} units)` : "Out of stock"}
              </span>
              <span>•</span>
              <span>Ghuba Verified Merchant</span>
            </div>

            {/* Description Snippet */}
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {cleanDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
