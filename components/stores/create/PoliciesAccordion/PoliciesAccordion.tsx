import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Policy } from '@/types/typings';

const POLICY = [
  "SHIPPING",
  "RETURNS",
  "PRIVACY",
  "TERMS"
];

export interface PoliciesAccordionProps {
  policies: Policy[];
  onUpdatePolicy: (index: number, field: keyof Policy, value: string) => void;
  onAddPolicy: () => void;
  onRemovePolicy: (index: number) => void;
}

const formatPolicyName = (name: string) => {
  return name.charAt(0) + name.slice(1).toLowerCase();
};

export default function PoliciesAccordion({
  policies,
  onUpdatePolicy,
  onAddPolicy,
  onRemovePolicy,
}: PoliciesAccordionProps) {
  const [open, setOpen] = useState(true);
  const isValid = policies.every(p => p.type && p.content?.trim());

  useEffect(() => {
    if (policies.length === 0) onAddPolicy();
  }, [policies, onAddPolicy]);

  return (
    <section className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      {/* Accordion Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 hover:bg-gray-50/70 dark:hover:bg-gray-850/50 focus:outline-none border-b border-gray-100 dark:border-gray-800 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-base font-semibold">Store Policies</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Manage your dynamic customer agreements</p>
          </div>
        </div>
        <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="p-4 sm:p-6 space-y-5 bg-gray-50/50 dark:bg-gray-950/20">
          {policies.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 italic py-4">No policies defined yet.</p>
          )}

          {policies.map((policy, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
            >
              {/* Card Header Actions */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="w-full max-w-xs relative">
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Policy Type
                  </label>
                  <select
                    value={policy.type}
                    onChange={(e) => onUpdatePolicy(idx, 'type', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option disabled hidden value="">Select policy type</option>
                    {POLICY.map(p => (
                      <option key={p} value={p}>
                        {formatPolicyName(p)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute bottom-2.5 right-2.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemovePolicy(idx)}
                  className="p-2 mt-4 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  aria-label="Remove policy"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Text Area Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Policy Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your terms, collection protocols, methods, timelines, or constraints..."
                  value={policy.content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    onUpdatePolicy(idx, 'content', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                />
              </div>
            </div>
          ))}

          {/* Action Footer Button Group */}
          <div className="pt-2 space-y-4">
            <button
              type="button"
              onClick={onAddPolicy}
              disabled={!isValid}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-700 active:bg-gray-100 dark:active:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-900"
            >
              <PlusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              Add policy block
            </button>

            {/* Context Notice */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-center sm:text-left text-xs text-gray-400 dark:text-gray-500 font-normal">
              <p className="italic">Provide detailed, honest clauses to protect your liabilities.</p>
              <div className="flex gap-1.5 items-center">
                <span>Suggestions:</span>
                {['Refunds', 'Fulfillment', 'Privacy'].map(ex => (
                  <span key={ex} className="px-1.5 py-0.5 bg-gray-200/60 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px] font-medium rounded">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}