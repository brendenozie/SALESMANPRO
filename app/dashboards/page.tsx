"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BuildingStorefrontIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
  PlusIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

import fit1 from "@/assets/fit1.png";
import { useSession, signOut } from "next-auth/react";

function WelcomeLoader() {
  return (
    <div className="min-h-screen bg-[#fafafa] overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute bottom-[0%] right-[5%] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-40 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Top Bar Skeleton */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "linear",
              }}
              className="relative"
            >
              <img
                src={fit1.src}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />

              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
            </motion.div>

            <div>
              <div className="h-4 w-28 bg-slate-200 rounded-full animate-pulse mb-2" />
              <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left */}
          <div className="lg:col-span-5">
            <div className="space-y-4">
              <div className="h-6 w-40 bg-slate-200 rounded-full animate-pulse" />

              <div className="space-y-3">
                <div className="h-16 w-full max-w-md bg-slate-300 rounded-3xl animate-pulse" />
                <div className="h-16 w-72 bg-slate-200 rounded-3xl animate-pulse" />
              </div>

              <div className="space-y-2 pt-4">
                <div className="h-4 w-full max-w-sm bg-slate-200 rounded-full animate-pulse" />
                <div className="h-4 w-72 bg-slate-100 rounded-full animate-pulse" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 pt-6">
                <div className="h-14 w-56 rounded-2xl bg-black/90 animate-pulse" />

                <div className="flex gap-3">
                  <div className="h-12 w-40 rounded-xl bg-white border border-slate-200 animate-pulse" />
                  <div className="h-12 w-40 rounded-xl bg-white border border-slate-200 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <motion.div
                key={item}
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  delay: item * 0.2,
                }}
                className="bg-white border border-slate-200 rounded-[2rem] p-8 min-h-[220px] relative overflow-hidden"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "linear",
                    }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-12"
                  />
                </div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 mb-6 animate-pulse" />

                  <div className="h-5 w-40 bg-slate-200 rounded-full mb-3 animate-pulse" />

                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-2/3 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Status Card */}
            <div className="sm:col-span-2 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-indigo-500 p-8 relative overflow-hidden">
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute inset-0 bg-white/10"
              />

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="space-y-3 w-full">
                  <div className="h-5 w-56 bg-white/30 rounded-full animate-pulse" />
                  <div className="h-4 w-72 bg-white/20 rounded-full animate-pulse" />
                </div>

                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        delay: i * 0.1,
                      }}
                      className="w-10 h-10 rounded-full bg-white/30 border border-white/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Loader */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              }}
              className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"
            />

            <span className="text-sm font-medium text-slate-600">
              Preparing your workspace...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const WelcomePage = () => {
  const { data: session, status } = useSession();

  const [greeting, setGreeting] = useState("");

  const userName = session?.user?.name?.split(" ")[0] || "Admin";

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const launchActions = [
    {
      title: "My Stores",
      desc: "Access your active locations",
      icon: <BuildingStorefrontIcon />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/stores",
    },
  ];

  // LOADER
  if (status === "loading" || !session || !session.user || !session.user.name ) {
    return <WelcomeLoader />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans p-4 md:p-8">
      {/* Top Bar */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <img
                src={fit1.src}
                alt="Logo"
                className="w-8 h-8 md:w-9 md:h-9 object-contain group-hover:rotate-12 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <span className="text-xl font-black tracking-tighter text-slate-900 transition-colors">
              Salesman
              <span className="text-orange-600">Pro</span>
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: `${window.location.origin || "/"}`,
            })
          }
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        {/* Left Hero */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-black mt-4 mb-6 tracking-tight leading-none">
              {greeting},
              <br />
              <span className="text-slate-400">
                {userName}.
              </span>
            </h1>

            <p className="text-lg text-slate-500 mb-8 max-w-sm leading-relaxed">
              Your ecosystem is ready. Select a module below to begin managing your commerce operations.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() =>
                  (window.location.href = "/stores/create")
                }
                className="flex items-center justify-center gap-3 bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all group w-full sm:w-fit"
              >
                <PlusIcon className="w-5 h-5" />

                Launch New Store

                <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Downloads */}
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="https://salesmanpro.site/download-desktop/SalesmanProDesktop.application"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-orange-500 transition-all shadow-sm"
                >
                  <ComputerDesktopIcon className="w-5 h-5 text-orange-600" />

                  Desktop App
                </a>

                <a
                  href="https://salesmanpro.site/download-mobile/app-release.apk"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-orange-500 transition-all shadow-sm"
                >
                  <DevicePhoneMobileIcon className="w-5 h-5 text-orange-600" />

                  Mobile App
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Bento Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {launchActions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1)",
              }}
              onClick={() =>
                (window.location.href = action.href)
              }
              className="group cursor-pointer bg-white border border-slate-200 p-8 rounded-[2rem] flex flex-col justify-between min-h-[220px] transition-all"
            >
              <div
                className={`w-14 h-14 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-4`}
              >
                {React.cloneElement(action.icon, {
                  className: "w-8 h-8",
                })}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-orange-500 transition-colors">
                  {action.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed">
                  {action.desc}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Status Tile */}
          <div className="sm:col-span-2 bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="text-xl font-bold tracking-tight">
                System Status: Optimal
              </h4>

              <p className="text-indigo-100 text-sm">
                All subdomains and custom gateways are
                operational.
              </p>
            </div>

            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-xs font-bold"
                >
                  U{i}
                </div>
              ))}

              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white text-orange-500 flex items-center justify-center text-xs font-bold">
                +12
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
};

export default WelcomePage;