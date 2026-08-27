"use client";
import React, { cloneElement } from "react";
import { motion } from "framer-motion";
import { UsersIcon, RocketLaunchIcon, HeartIcon } from "@heroicons/react/24/outline";
import MainLayout from "@/components/MainLayout";

export default function AboutPage() {
  return (
    <MainLayout>
          <div className="flex flex-col overflow-x-hidden">
            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                  We’re building the <span className="text-orange-600">future</span> of commerce.
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  SalesmanPro was born out of a simple idea: that managing a global business should be as easy as sending a text.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "Our Mission", icon: <RocketLaunchIcon />, desc: "To empower local merchants with enterprise-grade technology." },
                  { title: "Our People", icon: <UsersIcon />, desc: "A diverse team of dreamers, coders, and retail experts." },
                  { title: "Our Values", icon: <HeartIcon />, desc: "Integrity, speed, and customer-obsessed innovation." }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm">
                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 mb-6 flex items-center justify-center rounded-xl">
                      {cloneElement(item.icon, { className: "w-6 h-6" })}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </MainLayout>
  );
}