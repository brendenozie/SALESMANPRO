"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRightIcon, BoltIcon, BuildingLibraryIcon, CheckCircleIcon, GlobeAltIcon, LightBulbIcon, PlayCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import hero from "@/assets/hero.png";
import { useSession } from "next-auth/react";
import Link from "next/link";

// --- Feature Data ---
// Icons remain the same but will stand out more against the light background.
const features = [
  {
    title: "Instant Storefront",
    description: "Create and customize your online store in just a few clicks.",
    icon: <BuildingLibraryIcon className="h-8 w-8 text-red-500" />,
  },
  {
    title: "Free Website",
    description: "Get a stunning, modern website automatically with your store.",
    icon: <GlobeAltIcon className="h-8 w-8 text-red-500" />,
  },
  {
    title: "All-in-One Toolkit",
    description: "Manage products, payments, and orders from a single dashboard.",
    icon: <LightBulbIcon className="h-8 w-8 text-red-500" />,
  },
];

const handleGoogleSignIn = () => {
  const authUrl = new URL("https://auth.salesmanpro.site/signin");
  authUrl.searchParams.set("callbackUrl", window.location.origin);
  window.location.href = authUrl.toString();
};

const StepSection = () => (
  <section className="py-24 bg-slate-50 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        
        {/* Text Side */}
        <div className="lg:w-1/2">
          <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-6">
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            From idea to empire <br /> in three simple steps.
          </h2>
          
          <div className="space-y-8">
             {[
               { title: "1. Build your store", desc: "Use our visual editor to design your brand. No design skills needed." },
               { title: "2. Add your products", desc: "Upload digital or physical goods. " },
               { title: "3. Start selling", desc: "Publish your site and use our marketing tools to drive your first sale." }
             ].map((step, i) => (
               <div key={i} className="flex gap-4">
                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-orange-100 text-orange-600 font-bold flex items-center justify-center shadow-sm">
                   {i + 1}
                 </div>
                 <div>
                   <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                   <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Visual Side */}
        <div className="lg:w-1/2 relative">
           <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-yellow-200 rounded-full filter blur-3xl opacity-30"></div>
           <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                alt="Builder Interface" 
                className="rounded-xl w-full"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-50 flex items-center gap-3 animate-float">
                 <div className="bg-green-100 p-2 rounded-full"><CheckCircleIcon className="text-green-600 w-6 h-6"/></div>
                 <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="font-bold text-slate-900">Store Published</p>
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
    <div className="bg-white">
      <div className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-50">
        {/* --- Animated Aurora Background (Light Version) --- */}
        {/* Switched to lighter, pastel gradients with higher opacity to create a soft, ethereal glow on a light background. */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-pink-200/70 via-red-200/70 to-transparent blur-3xl"
            initial={{ x: -200, y: -200, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 1.5 } }}
          />
          <motion.div
            className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-gradient-to-tl from-cyan-200/70 via-yellow-200/70 to-transparent blur-3xl"
            initial={{ x: 200, y: 200, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 1.5, delay: 0.3 } }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
        Commerce v2.0 is Live
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
        Launch your dream <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-400">
          online universe.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
        The all-in-one platform to build, market, and manage your store. 
        No coding required.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        {!session ? (
                         <button onClick={handleGoogleSignIn}  className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-600/20 hover:bg-orange-700 hover:scale-105 transition-all flex items-center justify-center gap-2">
                          Create Your Store <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    ) : (
                      <Link
                        href="/dashboards"
                        className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-600/20 hover:bg-orange-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
                      >
                        Go to Dashboard <ArrowRightIcon className="w-5 h-5" />
                      </Link>
                    )}
       
        
        <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
          <PlayCircleIcon className="w-5 h-5 text-slate-400" />
          Watch Demo
        </button>
      </div>

      {/* Dashboard Visual */}
      <div className="relative mx-auto max-w-5xl group perspective-[1000px]">
        {/* Floating Elements */}
        <div className="absolute -left-12 top-20 p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-float hidden lg:block z-20 max-w-[200px]">
          <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg"><BoltIcon className="text-emerald-600 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Conversion Rate</p>
                <p className="text-lg font-bold text-slate-900">+12.5%</p>
              </div>
          </div>
        </div>

        <div className="absolute -right-8 bottom-32 p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-float-delayed hidden lg:block z-20">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg"><GlobeAltIcon className="text-yellow-400 w-5 h-5" /></div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Live Visitors</p>
                <p className="text-lg font-bold text-slate-900">1,402</p>
              </div>
          </div>
        </div>

        {/* Main Dashboard Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10 border border-slate-200 bg-white">
          {/* Browser Header */}
          <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
            </div>
            <div className="ml-4 px-3 py-1 bg-white rounded-md text-[10px] text-slate-400 border border-slate-100 shadow-sm flex items-center gap-2">
              <ShieldCheckIcon className="text-emerald-500 w-3 h-3"/>
              app.salesmanpro.site
            </div>
          </div>

          {/* Dashboard Body */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
             {/* Sidebar Mock */}
             <div className="hidden md:flex flex-col gap-4 pr-6 border-r border-slate-100">
                <div className="h-8 w-24 bg-slate-100 rounded-lg mb-4"></div>
                {[1,2,3,4,5].map(i => <div key={i} className="h-4 w-full bg-slate-50 rounded"></div>)}
             </div>

             {/* Main Content */}
             <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-lg">Overview</h3>
                    <div className="h-8 w-32 bg-slate-100 rounded-lg"></div>
                </div>
                
                {/* Charts Grid */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">Total Sales</div>
                      <div className="text-2xl font-bold text-slate-900">$48,290</div>
                      <div className="mt-4 h-16 flex items-end gap-1">
                         {[40,60,30,80,50,90,70].map((h,i) => (
                           <div key={i} className="flex-1 bg-orange-500 rounded-t-sm opacity-80" style={{height: `${h}%`}}></div>
                         ))}
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">Orders</div>
                      <div className="text-2xl font-bold text-slate-900">1,204</div>
                      <div className="mt-4 h-16 flex items-end gap-1">
                         {[20,40,60,40,50,70,60].map((h,i) => (
                           <div key={i} className="flex-1 bg-yellow-500 rounded-t-sm opacity-80" style={{height: `${h}%`}}></div>
                         ))}
                      </div>
                   </div>
                </div>
                
                {/* Table */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                   <div className="bg-slate-50 p-3 text-xs font-semibold text-slate-500">Recent Orders</div>
                   {[1,2,3].map(i => (
                     <div key={i} className="p-3 border-t border-slate-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                           <div className="w-24 h-3 bg-slate-100 rounded"></div>
                        </div>
                        <div className="w-12 h-3 bg-emerald-100 rounded"></div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

{/* Trusted By */}
    <div className="max-w-7xl mx-auto px-4 mt-20">
      <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by 20,000+ Business Owners</p>
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-80 duration-700">
          {['Acme', 'Bolt', 'Nylas', 'Feather', 'Spherule'].map(brand => (
            <span key={brand} className="text-xl font-extrabold text-slate-900">{brand}</span>
          ))}
      </div>
    </div>

      
        {/* --- Features Section --- */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} index={index} {...feature} />
            ))}
          </div>
        </div>

        <StepSection />
      </div>
    </div>
  );
}

// --- Interactive Hero Image Sub-component ---
function InteractiveHeroImage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-400, 400], [10, -10], { clamp: true });
  const rotateY = useTransform(mouseX, [-400, 400], [-10, 10], { clamp: true });

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
    <>
    <motion.div
      className="relative flex justify-center items-center h-full row-start-1 md:col-start-2"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5, ease: "easeOut" } }}
    >
      <motion.div
        className="relative w-full max-w-md lg:max-w-lg"
        style={{ rotateX, rotateY, transition: "transform 0.1s ease-out" }}
      >
        <img
          src={hero.src || "https://placehold.co/600x600/F9FAFB/374151?text=Hero+Image"}
          alt="Hero Illustration"
          className="w-full h-auto drop-shadow-2xl rounded-2xl"
        />
        {/* Floating UI elements with updated colors for light mode */}
        <motion.div
          className="absolute top-10 -right-12 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800"
          style={{ translateX: useTransform(mouseX, [-200, 200], [20, -20]), translateY: useTransform(mouseY, [-200, 200], [20, -20]) }}
        >
          🎉 Free Website Included
        </motion.div>
        <motion.div
          className="absolute bottom-10 -left-12 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800"
          style={{ translateX: useTransform(mouseX, [-200, 200], [-20, 20]), translateY: useTransform(mouseY, [-200, 200], [-20, 20]) }}
        >
          🚀 Ready to Sell
        </motion.div>
      </motion.div>
    </motion.div>
    <StepSection />
  </>
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
      // Switched from dark to a semi-transparent white background with a light border
      className="p-8 bg-white/50 backdrop-blur-lg rounded-2xl border border-gray-200 text-center"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </motion.div>
  );
}


