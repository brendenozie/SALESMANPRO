'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  PlusCircleIcon,
  CreditCardIcon,
  PaintBrushIcon,
  ShareIcon,
  XMarkIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted?: boolean;
}

interface MerchantOnboardingChecklistProps {
  slug: string;
  companyName: string;
  totalProducts?: number;
  hasPaymentConfig?: boolean;
}

export default function MerchantOnboardingChecklist({
  slug,
  companyName,
  totalProducts = 0,
  hasPaymentConfig = false,
}: MerchantOnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(`onboarding_dismissed_${slug}`);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
      try {
        const saved = localStorage.getItem(`onboarding_tasks_${slug}`);
        if (saved) {
          setCompletedTasks(JSON.parse(saved));
        }
      } catch (e) {
        // Ignore parse error
      }
    }
  }, [slug]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`onboarding_tasks_${slug}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarding_dismissed_${slug}`, 'true');
    }
  };

  const tasks: OnboardingTask[] = [
    {
      id: 'first_product',
      title: 'Add your first product or service',
      description: 'Upload product photos, set prices in KES, and manage inventory.',
      href: `/admin/${slug}/inventory`,
      icon: PlusCircleIcon,
      isCompleted: totalProducts > 0 || completedTasks['first_product'],
    },
    {
      id: 'mpesa_payments',
      title: 'Configure M-PESA Till, Paybill or Bank payments',
      description: 'Add your Safaricom Buy Goods Till or Bank details to collect payments instantly.',
      href: `/stores/${slug}/edit`,
      icon: CreditCardIcon,
      isCompleted: hasPaymentConfig || completedTasks['mpesa_payments'],
    },
    {
      id: 'brand_theme',
      title: 'Customize store branding & hero banners',
      description: 'Add your business logo, choose theme colors, and welcome your visitors.',
      href: `/stores/${slug}/edit`,
      icon: PaintBrushIcon,
      isCompleted: completedTasks['brand_theme'],
    },
    {
      id: 'live_storefront',
      title: 'Preview your live storefront',
      description: 'See exactly how customers experience your store on mobile and web.',
      href: `/site/${slug}`,
      icon: BuildingStorefrontIcon,
      isCompleted: completedTasks['live_storefront'],
    },
    {
      id: 'social_selling',
      title: 'Generate marketing campaigns & share on WhatsApp',
      description: 'Use SalesmanPro AI Studio to generate WhatsApp and TikTok promotional campaigns.',
      href: `/admin/${slug}/marketing`,
      icon: ShareIcon,
      isCompleted: completedTasks['social_selling'],
    },
  ];

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20 p-5 sm:p-7 shadow-sm relative overflow-hidden backdrop-blur-md"
    >
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60 dark:border-indigo-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Store Launch Checklist
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Complete these steps to activate {companyName} and start receiving verified customer orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition"
            title={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {isCollapsed ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 border border-slate-200/60 dark:border-slate-700 transition"
            title="Dismiss checklist"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-200/70 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Collapsible Tasks List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
                      task.isCompleted
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                        : 'bg-white/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition shrink-0"
                      title={task.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.isCompleted ? (
                        <CheckCircleSolid className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={task.href}
                          target={task.id === 'live_storefront' ? '_blank' : undefined}
                          rel={task.id === 'live_storefront' ? 'noopener noreferrer' : undefined}
                          className={`text-xs font-bold hover:underline truncate ${
                            task.isCompleted
                              ? 'text-slate-500 dark:text-slate-400 line-through'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </Link>
                        <Link
                          href={task.href}
                          target={task.id === 'live_storefront' ? '_blank' : undefined}
                          rel={task.id === 'live_storefront' ? 'noopener noreferrer' : undefined}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 shrink-0"
                        >
                          Open &rarr;
                        </Link>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-normal">
                        {task.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Turnkey Assistance Banner */}
            <div className="mt-4 pt-3 border-t border-indigo-100/60 dark:border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <BoltIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Short on time? Let our Nairobi team set up your products, logo, and M-PESA rails for you.
                </span>
              </div>
              <Link
                href="/stores#assisted-launch"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-white shadow-sm shrink-0 transition text-center"
              >
                Assisted Launch (KSh 10,000)
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

