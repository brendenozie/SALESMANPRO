"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  BanknotesIcon,
  ArrowRightIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/MainLayout';

const JOBS = [
  { id: 1, title: "Senior Full Stack Engineer", dept: "Engineering", type: "Full-time", location: "Remote / Nairobi", salary: "$80k - $120k" },
  { id: 2, title: "Product Designer (UI/UX)", dept: "Design", type: "Full-time", location: "Remote", salary: "$70k - $110k" },
  { id: 3, title: "Head of Growth", dept: "Marketing", type: "Contract", location: "Remote", salary: "$90k - $130k" },
  { id: 4, title: "Customer Success Lead", dept: "Operations", type: "Full-time", location: "Nairobi", salary: "$50k - $80k" },
];

const CareersPage = () => {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Engineering", "Design", "Marketing", "Operations"];

  const filteredJobs = filter === "All" ? JOBS : JOBS.filter(j => j.dept === filter);

  return (
    <MainLayout>
      <div className="flex flex-col overflow-x-hidden">
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero Section */}
            <section className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-sm font-black uppercase tracking-widest">
                  We're Hiring
                </span>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mt-6 mb-8">
                  Join the <span className="text-orange-600">Revolution.</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  We aren't just building a tool; we're building the infrastructure for the next generation of global commerce. Come build it with us.
                </p>
              </motion.div>
            </section>

            {/* Perks Bento Grid */}
            <section className="grid md:grid-cols-4 gap-4 mb-32">
              <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                <GlobeAltIcon className="w-12 h-12 text-orange-500 mb-6" />
                <div className="z-10">
                  <h3 className="text-3xl font-bold mb-2">Work from Anywhere</h3>
                  <p className="text-slate-400">Our team is distributed across 12 countries. We care about output, not your time zone.</p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl transition-transform group-hover:scale-150" />
              </div>

              <div className="bg-indigo-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center text-center">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BanknotesIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h4 className="font-bold text-lg dark:text-white">Equity & Options</h4>
                <p className="text-sm text-slate-500">Every team member is an owner of the company.</p>
              </div>

              <div className="bg-emerald-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-center text-center">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <SparklesIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="font-bold text-lg dark:text-white">Wellness Stipend</h4>
                <p className="text-sm text-slate-500">$200/mo for gym, mental health, or gear.</p>
              </div>
            </section>

            {/* Open Positions */}
            <section id="openings">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <h2 className="text-4xl font-black tracking-tight dark:text-white">Open Positions</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                        filter === cat 
                        ? "bg-orange-600 text-white shadow-lg" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, idx) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:shadow-2xl hover:border-orange-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-black uppercase text-orange-600 tracking-tighter">{job.dept}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{job.type}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                          {job.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mt-6 md:mt-0">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <MapPinIcon className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <ClockIcon className="w-4 h-4" />
                          {job.salary}
                        </div>
                        <div className="p-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          <ArrowRightIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <p className="text-slate-500 font-bold">No current openings for {filter}.</p>
                    <button onClick={() => setFilter("All")} className="text-orange-600 font-bold mt-2 underline">View all jobs</button>
                  </div>
                )}
              </div>
            </section>

            {/* Talent Pool Section */}
            <section className="mt-32 p-12 bg-slate-50 dark:bg-slate-900 rounded-[3rem] text-center border border-slate-200 dark:border-slate-800">
              <UserGroupIcon className="w-12 h-12 mx-auto mb-6 text-slate-400" />
              <h3 className="text-3xl font-black mb-4 dark:text-white">Don't see the right role?</h3>
              <p className="text-slate-500 max-w-lg mx-auto mb-8">
                We're always looking for exceptional talent. Join our talent pool, and we'll reach out when a role opens up that matches your profile.
              </p>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-sm">
                Join the Talent Pool
              </button>
            </section>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CareersPage;