'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardIcon,
  PlusCircleIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

type Stat = {
  label: string;
  value: string | number;
  iconUrl?: string;
};

type StatsAccordionProps = {
  stats: Stat[];
  onAdd: () => void;
  onUpdate: (idx: number, field: keyof Stat, value: string) => void;
  onRemove: (idx: number) => void;
};

export const StatsAccordion: React.FC<StatsAccordionProps> = ({ stats, onAdd, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(true);

  // Ensure at least one stat exists
  useEffect(() => {
    if (stats.length === 0) onAdd();
  }, [stats, onAdd]);

  const canAdd = stats.every(s => s.label.trim() && s.value.toString().trim());

  return (
    <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white"
      >
        <div className="flex items-center space-x-3">
          <ClipboardIcon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Business Stats</h2>
        </div>
        {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>

      {open && (
        <div className="px-6 py-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition"
              >
                {/* Remove button */}
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
                    onChange={e => onUpdate(idx, 'label', e.target.value)}
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
                    onChange={e => onUpdate(idx, 'value', e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-400 focus:border-emerald-400 transition"
                  />
                </div>

                {/* Icon URL */}
                <div className="mb-4">
                  <label htmlFor={`stat-icon-${idx}`} className="block text-sm font-medium text-gray-700">
                    Icon URL
                  </label>
                  <input
                    id={`stat-icon-${idx}`}
                    type="text"
                    placeholder="https://..."
                    value={stat.iconUrl || ''}
                    onChange={e => onUpdate(idx, 'iconUrl', e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-400 focus:border-emerald-400 transition"
                  />
                </div>

                {/* Preview */}
                {stat.iconUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={stat.iconUrl}
                      alt={`${stat.label} icon`}
                      className="h-10 w-10 object-contain rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-500">Preview</span>
                  </div>
                )}
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

          {/* Footer Tip */}
          <p className="text-sm text-gray-500 text-center">
            📊 Tip: Use icons from{' '}
            <a href="https://img.icons8.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline">
              Icons8
            </a>{' '}
            for richer visuals.
          </p>
        </div>
      )}
    </section>
  );
};