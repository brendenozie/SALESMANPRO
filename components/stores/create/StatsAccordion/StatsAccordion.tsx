'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type Stat = {
  label: string;
  value: string | number;
  iconUrl?: string;
};

type StatsAccordionProps = {
  stats: Stat[] | null;
  onAdd: () => void;
  onUpdate: (idx: number, field: keyof Stat, value: string) => void;
  onRemove: (idx: number) => void;
};

const presetIcons = [
  { name: 'Founded', url: 'https://img.icons8.com/color/96/company.png' },
  { name: 'Revenue', url: 'https://img.icons8.com/color/96/money-bag.png' },
  { name: 'Employees', url: 'https://img.icons8.com/color/96/conference.png' },
  { name: 'Branches', url: 'https://img.icons8.com/color/96/office.png' },
  { name: 'Clients', url: 'https://img.icons8.com/color/96/handshake.png' },
  { name: 'Awards', url: 'https://img.icons8.com/color/96/trophy.png' },
  { name: 'Partners', url: 'https://img.icons8.com/color/96/teamwork.png' },
];

export const StatsAccordion: React.FC<StatsAccordionProps> = ({
  stats,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeStatIndex, setActiveStatIndex] = useState<number | null>(null);

  useEffect(() => {
    if (stats && stats.length === 0) onAdd();
  }, [stats, onAdd]);

  const canAdd = stats && stats.every((s) => s.label.trim() && s.value.toString().trim());
  const filteredIcons = presetIcons.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const openIconModal = (idx: number) => {
    setActiveStatIndex(idx);
    setModalOpen(true);
  };

  const selectIcon = (url: string) => {
    if (activeStatIndex !== null) {
      onUpdate(activeStatIndex, 'iconUrl', url);
    }
    setModalOpen(false);
    setActiveStatIndex(null);
  };

  return (
    <section className="max-w-4xl mx-auto w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-colors duration-200">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-5 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-expanded={open}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <ClipboardIcon className="h-5 w-5" />
          </div>
          <h2 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">Business Statistics</h2>
        </div>
        <div className="text-zinc-400 dark:text-zinc-500">
          {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="p-5 sm:p-6 space-y-6">
              {/* Cards Grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats &&
                  stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                    >
                      {/* Section Top Controls */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                          Metric Block #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(idx)}
                          disabled={stats.length === 1}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-0 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-150"
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Stacked Input Layout */}
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor={`stat-label-${idx}`}
                            className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5"
                          >
                            Label Name
                          </label>
                          <input
                            id={`stat-label-${idx}`}
                            type="text"
                            placeholder="e.g. Total Revenue"
                            value={stat.label}
                            onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`stat-value-${idx}`}
                            className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5"
                          >
                            Display Value
                          </label>
                          <input
                            id={`stat-value-${idx}`}
                            type="text"
                            placeholder="e.g. $2.4M or 2026"
                            value={stat.value}
                            onChange={(e) => onUpdate(idx, 'value', e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
                          />
                        </div>

                        {/* Combined Inline Picker Trigger */}
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Visual Icon
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openIconModal(idx)}
                              className="flex-1 flex items-center justify-between text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              <span className="truncate">
                                {stat.iconUrl
                                  ? presetIcons.find((i) => i.url === stat.iconUrl)?.name || 'Custom Symbol'
                                  : 'Select contextual asset...'}
                              </span>
                              <ChevronDownIcon className="h-4 w-4 text-zinc-400 flex-shrink-0 ml-2" />
                            </button>

                            <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5">
                              {stat.iconUrl ? (
                                <img
                                  src={stat.iconUrl}
                                  alt="Current view selection"
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="h-full w-full border border-dashed border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {/* Empty Action Layout Field */}
                {stats && (
                  <button
                    type="button"
                    onClick={canAdd ? onAdd : undefined}
                    disabled={!canAdd}
                    className={`flex flex-col justify-center items-center border-2 border-dashed rounded-xl p-6 transition-all min-h-[220px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      canAdd
                        ? 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-zinc-400 hover:text-emerald-500 dark:text-zinc-600 dark:hover:text-emerald-400'
                        : 'border-zinc-100 dark:border-zinc-900 opacity-40 cursor-not-allowed text-zinc-300 dark:text-zinc-700'
                    }`}
                  >
                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-2">
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Add New Metric</span>
                  </button>
                )}
              </motion.div>

              {/* Informational Subtext Footer */}
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center pt-2">
                Assets powered by{' '}
                <a
                  href="https://icons8.com/icons"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline focus:outline-none"
                >
                  Icons8
                </a>
                . Fill current slots completely to unlock additions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Grid Selection Overlay */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay Mask */}
            <motion.div
              className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            />

            {/* Content Window Frame */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Header section */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">Select Asset Icon</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Filtering and Content Box */}
              <div className="p-6 space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Search asset listings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Scrolled Frame Selection area */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((icon) => (
                      <button
                        type="button"
                        key={icon.url}
                        onClick={() => selectIcon(icon.url)}
                        className="group flex flex-col items-center p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.02] transition text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <div className="h-12 w-12 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-150">
                          <img src={icon.url} alt={icon.name} className="h-full w-full object-contain" />
                        </div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-2.5 max-w-full truncate">
                          {icon.name}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center col-span-full py-10">
                      <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        No matches found for &ldquo;{search}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};