import React from "react";
import { Metadata } from "next";
import { resolveDirectPayLink } from "@/lib/pay-links/service";
import { DirectPayCheckoutClient } from "@/components/pay/DirectPayCheckoutClient";
import Link from "next/link";
import { HiExclamationTriangle } from "react-icons/hi2";

interface PageProps {
  params: Promise<{ slug: string; code: string }> | { slug: string; code: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const code = resolvedParams.code;

  const resolution = await resolveDirectPayLink(code, {
    incrementVisit: false,
  });

  if (!resolution.success || !resolution.product) {
    return {
      title: "Direct Pay Checkout | Store",
      description: "Secure, direct checkout link.",
    };
  }

  const title = `Buy ${resolution.product.name} | ${resolution.store?.name || "Official Store"}`;
  const description = `Direct checkout for ${resolution.product.name} at ${resolution.link?.currency || "KES"} ${resolution.product.price.toLocaleString()}.`;
  const image = resolution.product.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function StoreDirectPayPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const code = resolvedParams.code;
  const slug = resolvedParams.slug;

  const resolution = await resolveDirectPayLink(code, {
    incrementVisit: true,
  });

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
              href={`/site/${slug}`}
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DirectPayCheckoutClient initialData={resolution} linkCode={code} />;
}
