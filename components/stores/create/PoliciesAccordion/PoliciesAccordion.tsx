import React, { ChangeEvent } from 'react';

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
  const isValid = policies.every(policy => policy.type && policy.content);

  return (
    <div className="max-w-3xl mx-auto overflow-hidden">
      <button
        type="button"
        onClick={onAddPolicy}
        disabled={!isValid}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Policies</span>
        <span className="text-xl">{policies.length > 0 ? '✅' : '+'}</span>
      </button>

      <div className="p-6 space-y-6">
        {policies.map((policy, idx) => (
          <div key={idx} className="space-y-3">
            <input
              placeholder="Type (e.g. Refunds)"
              value={policy.type}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdatePolicy(idx, 'type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <textarea
              placeholder="Content"
              value={policy.content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onUpdatePolicy(idx, 'content', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
            <button
              type="button"
              onClick={() => onRemovePolicy(idx)}
              className="text-red-500 font-medium focus:outline-none"
              title="Remove Policy"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddPolicy}
          className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
        >
          Add Another Policy
        </button>

        <p className="text-sm text-gray-500 mt-2">
          Add your store policies. You can add multiple policies.
        </p>
        <p className="text-sm text-gray-500">
          Example: <code>Refund Policy</code>, <code>Shipping Policy</code>, <code>Privacy Policy</code>
        </p>
      </div>
    </div>
  );
}