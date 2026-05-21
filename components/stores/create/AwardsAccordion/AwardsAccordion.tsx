'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Award } from '../../../../types/typings';

interface Props {
  awards: Award[] | null;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Award, value: any) => void;
  onRemove: (index: number) => void;
}

const ICON_OPTIONS = [
  { name: 'Gold Trophy', url: 'https://img.icons8.com/color/96/000000/trophy.png' },
  { name: 'Medal', url: 'https://img.icons8.com/color/96/medal.png' },
  { name: 'Crown', url: 'https://img.icons8.com/color/96/000000/crown.png' },
  { name: 'Star Badge', url: 'https://img.icons8.com/color/96/000000/filled-star.png' },
  { name: 'Diamond', url: 'https://img.icons8.com/color/96/000000/diamond.png' },
  { name: 'Certificate', url: 'https://img.icons8.com/color/96/certificate.png' },
  { name: 'Trophy Cup', url: 'https://img.icons8.com/color/96/000000/prize.png' },
  { name: 'Achievement', url: 'https://img.icons8.com/color/96/trophy--v1.png' },
];

const isFilled = (award: Award) => award.name.trim() && award.iconUrl.trim();

export const AwardsAccordion: React.FC<Props> = ({
  awards,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const canAdd =
    awards?.length === 0 || (awards && isFilled(awards[awards.length - 1]));

  useEffect(() => {
    if (!awards?.length) onAdd();
  }, [awards, onAdd]);

  const filteredIcons = ICON_OPTIONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-4xl mx-auto w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-all duration-200">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-5 sm:px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-expanded={open}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
            <TrophyIcon className="h-5 w-5" />
          </div>
          <h3 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">Awards & Achievements</h3>
        </div>
        <div className="text-zinc-400 dark:text-zinc-500">
          {open ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="p-5 sm:p-6 space-y-6">
              {/* Empty State */}
              {(!awards || awards.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-10 px-4"
                >
                  <TrophyIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-pulse" />
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">No awards documented</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs mx-auto">
                    Start by documenting your notable career victories, certificates, or milestones.
                  </p>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-sm rounded-lg shadow-sm transition"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add First Award</span>
                  </button>
                </motion.div>
              )}

              {/* Awards Grid */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {awards &&
                  awards.map((award, idx) => (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 sm:p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                    >
                      {/* Card Context Header */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                          Award Entry #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(idx)}
                          aria-label="Remove award"
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-150"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Fields Stack */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Award Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Employee of the Year"
                            value={award.name}
                            onChange={(e) => onUpdate(idx, 'name', e.target.value)}
                            className="w-full text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                          />
                          {!award.name.trim() && (
                            <p className="text-xs text-red-500 dark:text-red-400/80 mt-1.5 pl-0.5">
                              Please enter an award name
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                            Visual Identifier Icon
                          </label>
                          <div className="flex sm:items-center gap-3 flex-col sm:flex-row">
                            <button
                              type="button"
                              onClick={() => setSelectedIndex(idx)}
                              className="flex-1 flex items-center justify-between text-sm px-3 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition text-left focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                            >
                              <span className="truncate">
                                {award.iconUrl
                                  ? ICON_OPTIONS.find((icon) => icon.url === award.iconUrl)?.name || 'Custom Icon'
                                  : 'Pick stylized badge...'}
                              </span>
                              <ChevronDownIcon className="h-4 w-4 text-zinc-400 flex-shrink-0 ml-2" />
                            </button>

                            {award.iconUrl && (
                              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 self-start sm:self-auto">
                                <img
                                  src={award.iconUrl}
                                  alt="Icon preview"
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {/* Add New Interactive Placeholder Slot */}
                {awards && (
                  <button
                    type="button"
                    onClick={canAdd ? onAdd : undefined}
                    disabled={!canAdd}
                    className={`flex flex-col justify-center items-center border-2 border-dashed rounded-xl p-6 transition-all min-h-[180px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                      canAdd
                        ? 'border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-zinc-400 hover:text-amber-500 dark:text-zinc-600 dark:hover:text-amber-400'
                        : 'border-zinc-100 dark:border-zinc-900 opacity-40 cursor-not-allowed text-zinc-300 dark:text-zinc-700'
                    }`}
                  >
                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-2 group-hover:scale-110 transition-transform">
                      <PlusIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Add Another Award</span>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Asset Selector */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop layer */}
            <motion.div
              className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">
                  Select Award Icon
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Search Inputs */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Filter icons by tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Micro-Asset Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {filteredIcons.map((icon) => (
                    <button
                      type="button"
                      key={icon.url}
                      onClick={() => {
                        onUpdate(selectedIndex!, 'iconUrl', icon.url);
                        setSelectedIndex(null);
                        setSearch('');
                      }}
                      className="group flex flex-col items-center p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.02] transition text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <div className="h-12 w-12 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-150">
                        <img
                          src={icon.url}
                          alt={icon.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-2.5 max-w-full truncate">
                        {icon.name}
                      </p>
                    </button>
                  ))}
                </div>

                {filteredIcons.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      No badges match &ldquo;{search}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};