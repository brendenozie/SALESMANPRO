import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveDirectPayLink } from "@/lib/pay-links/service";
import { DirectPayCheckoutClient } from "@/components/pay/DirectPayCheckoutClient";
import Link from "next/link";
import { HiExclamationTriangle } from "react-icons/hi2";

interface PageProps {
  params: Promise<{ code: string }> | { code: string };
}

/**
 * Generate accurate social media / WhatsApp link previews.
 * Fetches preview metadata without incrementing visit counter.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const code = resolvedParams.code;

  const resolution = await resolveDirectPayLink(code, {
    incrementVisit: false,
  });

  if (!resolution.success || !resolution.product) {
    return {
      title: "Direct Pay Checkout | SalesmanPro",
      description: "Secure, direct checkout link for SalesmanPro stores.",
    };
  }

  const title = `Buy ${resolution.product.name} | ${resolution.store?.name || "Official Store"}`;
  const description = `Direct 1-tap checkout for ${resolution.product.name}. Pre-configured options, real-time stock, and instant M-Pesa / Card payment.`;
  const image = resolution.product.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function DirectPayPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const code = resolvedParams.code;

  // Resolve link with visit tracking
  const resolution = await resolveDirectPayLink(code, {
    incrementVisit: true,
  });

  // Handle Invalid / Expired / Revoked / Out-of-Stock States Gracefully
  if (!resolution.success || !resolution.product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <HiExclamationTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Payment Link Unavailable</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {resolution.error || "This direct payment link could not be loaded or has expired."}
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Out of Stock Product
  if (!resolution.product.isAvailable || resolution.product.quantity <= 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <HiExclamationTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Item Currently Sold Out</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">{resolution.product.name}</strong> is currently out of stock. The store has been notified to replenish inventory.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Browse Other Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DirectPayCheckoutClient initialData={resolution} linkCode={code} />;
}
