import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export interface Policy {
  type: string;
  content: string;
}

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

export default function PoliciesAccordion({
  policies,
  onUpdatePolicy,
  onAddPolicy,
  onRemovePolicy,
}: PoliciesAccordionProps) {
  const [open, setOpen] = useState(true);
  const isValid = policies.every(p => p.type.trim() && p.content.trim());
  
    useEffect(() => {
      if (policies.length === 0) onAddPolicy();
    }, [policies, onAddPolicy]);

  return (
    <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="flex items-center space-x-3">
          <ClipboardDocumentListIcon className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Store Policies</h2>
        </div>
        {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="px-6 py-8 space-y-6">
          {policies.length === 0 && (
            <p className="text-center text-gray-500 italic">No policies defined yet.</p>
          )}

          {policies.map((policy, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {/* Policy */}
                  <select
                    value={policy.type}
                    onChange={(e) => onUpdatePolicy(idx, 'type', e.target.value)}
                    className="block flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option disabled hidden value="">Select policy</option>
                      {POLICY.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePolicy(idx)}
                  className="text-red-500 hover:text-red-600 focus:outline-none self-start"
                  aria-label="Remove policy"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your policy details here..."
                  value={policy.content}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    onUpdatePolicy(idx, 'content', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddPolicy}
            disabled={!isValid}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition disabled:opacity-50"
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>Add Policy</span>
          </button>

          <div className="pt-4 text-sm text-gray-600 space-y-1">
            <p className="italic">Provide clear terms to build customer trust.</p>
            <p>
              Common examples:{' '}
              {['Refund Policy', 'Shipping Policy', 'Privacy Policy'].map(ex => (
                <code key={ex} className="bg-gray-100 px-1 mx-1 rounded">
                  {ex}
                </code>
              ))}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}