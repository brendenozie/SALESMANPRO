"use client";

import React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const handleAuthRedirect = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900">
      {/* Final Call To Action Banner */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-center border-b border-slate-900">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          Ready to Run Your Business Smarter?
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm md:text-base">
          Bring your storefront, inventory, POS, payments, and AI agents into one powerful operating platform.
        </p>
        <button
          onClick={handleAuthRedirect}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold px-9 py-4 text-base shadow-xl shadow-orange-500/20 hover:scale-105 transition-all duration-200"
        >
          <span>Start Free Today</span>
          <ArrowRightIcon className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs text-slate-400">
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2 font-black text-white text-base">
            <span className="w-7 h-7 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-black">
              S
            </span>
            SALESmanPRO
          </div>
          <p className="text-slate-500 max-w-sm">
            The intelligent e-commerce and operations platform designed for modern merchants.
          </p>
          <div className="text-slate-600 font-mono">© 2026 SalesmanPro. All rights reserved.</div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Platform</h4>
          <ul className="space-y-2">
            <li><Link href="#ai-studio" className="hover:text-white">AI Studio</Link></li>
            <li><Link href="#whatsapp" className="hover:text-white">WhatsApp Commerce</Link></li>
            <li><Link href="#business-ops" className="hover:text-white">POS & Inventory</Link></li>
            <li><Link href="#pricing" className="hover:text-white">Pricing Plans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Resources</h4>
          <ul className="space-y-2">
            <li><Link href="#workflow" className="hover:text-white">Documentation</Link></li>
            <li><Link href="#trust" className="hover:text-white">Security Ledger</Link></li>
            <li><a href="https://salesmanpro.site/contact" className="hover:text-white">Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Legal</h4>
          <ul className="space-y-2">
            <li><a href="https://salesmanpro.site/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="https://salesmanpro.site/terms" className="hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}