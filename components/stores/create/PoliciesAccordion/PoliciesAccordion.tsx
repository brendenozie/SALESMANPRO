import React, { ChangeEvent } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

export interface Policy {
  type: string;
  content: string;
}

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
  const isValid = policies.every((policy) => policy.type && policy.content);

  const visiblePolicies = policies.length > 0 ? policies : [{ type: '', content: '' }];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header Button */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md">
        <span className="flex items-center gap-2">
          <ClipboardDocumentIcon className="h-5 w-5" />
          Store Policies
        </span>
        <span className="text-lg">{policies.length > 1 ? '✅' : <PlusIcon className="h-5 w-5" />}</span>
      </div>

      {/* Policies List */}
      <div className="mt-6 space-y-6">
        {visiblePolicies.map((policy, idx) => (
          <div
            key={idx}
            className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition"
          >
            <input
              placeholder="Policy Type (e.g. Refund Policy)"
              value={policy.type}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdatePolicy(idx, 'type', e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Policy Content"
              value={policy.content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                onUpdatePolicy(idx, 'content', e.target.value)
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {idx !== 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemovePolicy(idx)}
                  className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition"
                >
                  <TrashIcon className="h-5 w-5" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Another Policy Button */}
        <button
          type="button"
          onClick={onAddPolicy}
          disabled={!isValid}
          className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 border border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Add Another Policy
        </button>

        {/* Example Guidance */}
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>Specify store policies to inform your customers clearly.</p>
          <p>
            Examples:{" "}
            {['Refund Policy', 'Shipping Policy', 'Privacy Policy'].map((example) => (
              <code key={example} className="bg-gray-100 px-1 mx-0.5 rounded">
                {example}
              </code>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
