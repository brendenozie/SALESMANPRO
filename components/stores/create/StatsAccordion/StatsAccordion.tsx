'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardIcon,
  PlusCircleIcon,
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

// Example preset icons (customize or extend)
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

  // Ensure at least one stat exists
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
    <section className="max-w-4xl mx-auto overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white"
      >
        <div className="flex items-center space-x-3">
          <ClipboardIcon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Business Stats</h2>
        </div>
        {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="px-6 py-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats &&
              stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="relative bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
                >
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    disabled={stats.length === 1}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 focus:outline-none disabled:opacity-40"
                    title="Remove stat"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Label */}
                  <div className="mb-4">
                    <label htmlFor={`stat-label-${idx}`} className="block text-sm font-medium text-gray-700">
                      Label
                    </label>
                    <input
                      id={`stat-label-${idx}`}
                      type="text"
                      placeholder="e.g. Founded"
                      value={stat.label}
                      onChange={(e) => onUpdate(idx, 'label', e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-400 focus:border-emerald-400 transition"
                    />
                  </div>

                  {/* Value */}
                  <div className="mb-4">
                    <label htmlFor={`stat-value-${idx}`} className="block text-sm font-medium text-gray-700">
                      Value
                    </label>
                    <input
                      id={`stat-value-${idx}`}
                      type="text"
                      placeholder="e.g. 2019"
                      value={stat.value}
                      onChange={(e) => onUpdate(idx, 'value', e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-400 focus:border-emerald-400 transition"
                    />
                  </div>

                  {/* Icon Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <div className="mt-2 flex items-center gap-4">
                      {stat.iconUrl ? (
                        <img
                          src={stat.iconUrl}
                          alt={`${stat.label} icon`}
                          className="h-10 w-10 object-contain rounded border border-gray-300"
                        />
                      ) : (
                        <div className="h-10 w-10 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm">
                          No Icon
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => openIconModal(idx)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                      >
                        Choose Icon
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Stat */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onAdd}
              disabled={!canAdd}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none disabled:opacity-50 transition"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Add Stat
            </button>
          </div>

          {/* Tip */}
          <p className="text-sm text-gray-500 text-center">
            📊 Tip: Use icons from{' '}
            <a
              href="https://icons8.com/icons"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 underline"
            >
              Icons8
            </a>{' '}
            for richer visuals.
          </p>
        </div>
      )}

      {/* Icon Selector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select an Icon</h3>

            {/* Search */}
            <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((icon) => (
                  <button
                    key={icon.url}
                    onClick={() => selectIcon(icon.url)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 transition"
                  >
                    <img src={icon.url} alt={icon.name} className="h-14 w-14 object-contain" />
                    <span className="text-xs text-gray-600">{icon.name}</span>
                  </button>
                ))
              ) : (
                <p className="text-center col-span-full text-gray-500">No icons found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
