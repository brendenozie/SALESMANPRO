"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { 
  ArrowRightIcon, 
  BoltIcon, 
  BuildingStorefrontIcon, 
  CheckCircleIcon, 
  GlobeAltIcon, 
  PlayCircleIcon, 
  ShieldCheckIcon,
  ShoppingBagIcon,
  TruckIcon,
  BanknotesIcon,
  SparklesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Link from "next/link";

// --- Feature Data focused on Self-Service & Commerce OS ---
const features = [
  {
    title: "Instant Custom Storefront",
    description: "Launch a full standalone e-commerce website in 3 minutes. Your customers browse, select, and checkout on autopilot 24/7.",
    icon: <BuildingStorefrontIcon className="h-8 w-8 text-orange-600" />,
  },
  {
    title: "Automated M-PESA Checkout",
    description: "Accept direct M-PESA Paybill, Till, or STK Push payments. Money settles straight to your wallet with zero withdrawal fees.",
    icon: <BanknotesIcon className="h-8 w-8 text-orange-600" />,
  },
  {
    title: "Delivery setup in 1 click",
    description: "Pre-configured shipping routes across Kenya. Buyers choose their exact Pickup Mtaani agent or Matatu SACCO at checkout.",
    icon: <TruckIcon className="h-8 w-8 text-orange-600" />,
  },
];

const handleGoogleSignIn = () => {
  const authUrl = new URL("https://auth.salesmanpro.site/signin");
  authUrl.searchParams.set("callbackUrl", window.location.origin);
  window.location.href = authUrl.toString();
};

// --- Step Section Component ---
const StepSection = () => (
  <section className="py-24 bg-slate-50 overflow-hidden border-t border-slate-200/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        
        {/* Text Side */}
        <div className="lg:w-1/2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">
            <SparklesIcon className="w-4 h-4 text-orange-600" />
            Automated Selling Engine
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Put your store on autopilot in <span className="text-orange-600">3 simple steps.</span>
          </h2>
          
          <div className="space-y-8">
            {[
              { 
                title: "1. Launch your website", 
                desc: "Set up your brand name, sub-domain, and upload your product catalog in minutes with zero coding." 
              },
              { 
                title: "2. Set up payout & delivery", 
                desc: "Connect your M-PESA Till/Paybill and select your delivery regions (Preferred Courier)." 
              },
              { 
                title: "3. Share link & sell 24/7", 
                desc: "Put your link on social media. Buyers place orders and pay automatically while you sleep—wake up to ready cash." 
              }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shadow-md shadow-orange-600/20">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed mt-1 text-sm md:text-base">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Side */}
        <div className="lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-300 via-amber-200 to-yellow-100 rounded-full filter blur-3xl opacity-40"></div>
          <div className="relative bg-white p-3 rounded-2xl shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 font-mono text-xs text-slate-400">brand.salesmanpro.site</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-medium">Store Active</span>
            </div>
            
            {/* Mock Direct E-Commerce Checkout Preview */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Self-Service Checkout</p>
                    <p className="text-xs text-slate-500">1x Wireless ANC Headphones</p>
                  </div>
                </div>
                <span className="font-extrabold text-orange-600">KES 6,500</span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <TruckIcon className="w-4 h-4 text-orange-600" /> Fulfillment
                  </span>
                  <span className="font-semibold text-slate-900">Preferred Courier</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BanknotesIcon className="w-4 h-4 text-emerald-600" /> Express Checkout
                  </span>
                  <span className="font-bold text-emerald-600">M-PESA Paid via STK</span>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-full">
                <CheckCircleIcon className="text-emerald-600 w-6 h-6"/>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500">Order Automated</p>
                <p className="font-bold text-slate-900 text-sm">Cash Settled to Wallet</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
);

// --- Main Banner Component ---
export default function Banner() {
  const { data: session } = useSession();

  return (
    <div className="bg-white text-slate-900 font-sans">
      <div className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-28 bg-slate-50">
        
        {/* Background Aurora Blur */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-orange-200/60 via-amber-200/50 to-transparent blur-3xl"
            initial={{ x: -200, y: -200, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 1.5 } }}
          />
          <motion.div
            className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-gradient-to-tl from-emerald-100/60 via-yellow-100/50 to-transparent blur-3xl"
            initial={{ x: 200, y: 200, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 1.5, delay: 0.3 } }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Platform Category Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200 text-orange-700 text-xs font-bold tracking-wide mb-8 shadow-sm hover:shadow-md transition-shadow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            The All-in-One E-Commerce OS for Kenyan Businesses
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            Sell Online 24/7. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500">
              Even When You're Offline.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get a professional online store in minutes. Let customers browse, check out with M-PESA, and pick delivery options automatically.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {!session ? (
              <button 
                onClick={handleGoogleSignIn}  
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-full font-extrabold text-base md:text-lg shadow-xl shadow-orange-600/25 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Launch Free Storefront <ArrowRightIcon className="w-5 h-5 stroke-[2.5]" />
              </button>
            ) : (
              <Link
                href="/dashboards"
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-full font-extrabold text-base md:text-lg shadow-xl shadow-orange-600/25 hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Go to Merchant Dashboard <ArrowRightIcon className="w-5 h-5 stroke-[2.5]" />
              </Link>
            )}
            
            <button 
              onClick={() => window.open("https://www.youtube.com/watch?v=Wr-FUeEvWoc", "_blank")}        
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-300 text-slate-700 rounded-full font-bold text-base md:text-lg hover:bg-slate-100 hover:border-slate-400 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <PlayCircleIcon className="w-6 h-6 text-orange-600" />
              Watch Store Tour
            </button>
          </div>

          {/* Pricing Guarantee */}
          <p className="text-xs md:text-sm font-semibold text-slate-500 mb-12 flex items-center justify-center gap-3 flex-wrap">
            <span>✓ Start for Free</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ No Setup Charges</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Instant Wallet Withdrawals</span>
          </p>

          {/* Hero Storefront/Dashboard Interactive Preview */}
          <InteractiveHeroCard />

          {/* Integration Proof Points */}
          <div className="mt-20 border-t border-slate-200/80 pt-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Powered by Kenya's Leading Commerce Infrastructure
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 font-extrabold text-slate-400 text-sm sm:text-base">
              {/* <span className="text-emerald-600 font-black tracking-tight flex items-center gap-1.5 text-lg">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> M-PESA
              </span> */}
              {/* <span className="hover:text-slate-700 transition-colors">Pickup Integration</span> */}
              {/* <span className="hover:text-slate-700 transition-colors"> Deliveries</span> */}
              {/* <span className="hover:text-slate-700 transition-colors">Instagram Store Sync</span> */}
            </div>
          </div>

        </div>
      </div>

      {/* --- Key Features Section --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900">Built to automate your full sales cycle</h2>
          <p className="text-slate-500 mt-3 text-base">Stop managing manual orders or verifying individual payment screenshots. Let your website do the heavy lifting.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} index={index} {...feature} />
          ))}
        </div>
      </div>

      {/* --- Step-by-Step Workflow Section --- */}
      <StepSection />
    </div>
  );
}

// --- Interactive Store & Admin Sub-component ---
function InteractiveHeroCard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-400, 400], [4, -4], { clamp: true });
  const rotateY = useTransform(mouseX, [-400, 400], [-4, 4], { clamp: true });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div 
      className="relative mx-auto max-w-5xl group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 1, delay: 0.2, ease: "easeOut" } }}
    >
      <motion.div 
        style={{ rotateX, rotateY }}
        className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-950/10 border border-slate-200 bg-white transition-all duration-200 ease-out"
      >
        {/* Mock Window Top Bar */}
        <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          </div>
          <div className="px-3 py-1 bg-white rounded-md text-[11px] text-slate-500 border border-slate-200 shadow-sm flex items-center gap-2 font-mono">
            <ShieldCheckIcon className="text-emerald-600 w-3.5 h-3.5"/>
            admin.salesmanpro.site/analytics
          </div>
          <div className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">M-PESA Gateway Active</div>
        </div>

        {/* Dashboard Body Mock */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col gap-3 pr-6 border-r border-slate-100">
            <div className="h-7 w-28 bg-orange-600/10 text-orange-600 text-xs font-bold rounded-lg flex items-center px-3 mb-2">
              SalesmanPro OS
            </div>
            {['Overview', 'My E-Commerce Website', 'Products & Inventory', 'Automated Orders', 'Logistics Hub'].map((item, i) => (
              <div key={i} className={`h-8 w-full rounded-md flex items-center px-3 text-xs font-semibold ${i === 0 ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                {item}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">E-Commerce Performance</h3>
                <p className="text-xs text-slate-500">Live store metrics & self-service sales</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                Today (EAT)
              </span>
            </div>
            
            {/* Real Stats Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="text-xs text-slate-500 font-medium mb-1">Gross Sales Revenue</div>
                <div className="text-xl md:text-2xl font-black text-slate-900">KES 184,200</div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <ChartBarIcon className="w-3.5 h-3.5" />
                  <span>+24.5% vs last week</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-xs text-slate-500 font-medium mb-1">Completed Checkout Sales</div>
                <div className="text-xl md:text-2xl font-black text-slate-900">56 Completed</div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <span>100% M-PESA Auto-Verified</span>
                </div>
              </div>
            </div>
            
            {/* Automated Orders Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 p-3 text-xs font-bold text-slate-600 border-b border-slate-200 flex justify-between">
                <span>Recent Website Checkout Orders</span>
                <span>Fulfillment</span>
              </div>
              {[
                { name: "Order #8402 (Nairobi)", item: "Designer Dress", price: "KES 4,500", delivery: "Mani" },
                { name: "Order #8401 (Nakuru)", item: "Leather Shoes", price: "KES 3,200", delivery: "MoCCO" },
                { name: "Order #8400 (Mombasa)", item: "Smart Watch", price: "KES 8,900", delivery: "Mani" },
              ].map((row, i) => (
                <div key={i} className="p-3 border-t border-slate-100 flex justify-between items-center bg-white text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{row.name}</p>
                    <p className="text-[11px] text-slate-400">{row.item} • {row.price}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px] border border-slate-200">
                    {row.delivery}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Badges */}
      <motion.div 
        className="absolute -left-10 top-20 p-4 bg-white rounded-2xl border border-slate-200 shadow-xl hidden lg:block z-20 max-w-[210px] text-left"
        style={{ x: useTransform(mouseX, [-400, 400], [12, -12]), y: useTransform(mouseY, [-400, 400], [12, -12]) }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-xl"><BoltIcon className="text-emerald-600 w-5 h-5" /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Self-Service</p>
            <p className="text-sm font-bold text-slate-900">Zero Manual Chat</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="absolute -right-8 bottom-20 p-4 bg-white rounded-2xl border border-slate-200 shadow-xl hidden lg:block z-20 text-left max-w-[210px]"
        style={{ x: useTransform(mouseX, [-400, 400], [-12, 12]), y: useTransform(mouseY, [-400, 400], [-12, 12]) }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2.5 rounded-xl"><GlobeAltIcon className="text-orange-600 w-5 h-5" /></div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Full Website</p>
            <p className="text-sm font-bold text-slate-900">Custom Subdomain</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Feature Card Sub-component ---
function FeatureCard({ icon, title, description, index }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      className="p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-center mb-5">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 mt-2 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}