import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';
import debounce from "lodash.debounce";
import {
  MapPinIcon,
  ChevronDownIcon,
  InboxIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  ChevronUpIcon, 
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from '@heroicons/react/24/solid';

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};


interface Policy {
  type: string;
  content: string;
}

interface PoliciesAccordionProps {
  form: {
    policies?: Policy[];
  };
  handleArrayChange: (field: 'policies', index: number, key: keyof Policy, value: string) => void;
  addArrayItem: (field: 'policies', item: Policy) => void;
  removeArrayItem: (field: 'policies', index: number) => void;
}

const PoliciesAccordion: React.FC<PoliciesAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const policies = form.policies || [];
  const isValid = policies.every(p => p.type && p.content);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('policies', { type: '', content: '' })}
        disabled={!isValid}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Policies</span>
        <span className="text-xl">{policies.length > 0 ? '✅' : '+'}</span>
      </button>

      {policies.length > 0 && (
        <div className="p-6 space-y-6">
          {policies.map((p, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Type (e.g. Refunds)"
                value={p.type}
                onChange={e => handleArrayChange('policies', i, 'type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Content"
                value={p.content}
                onChange={e => handleArrayChange('policies', i, 'content', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('policies', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove Policy"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('policies', { type: '', content: '' })}
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
      )}
    </div>
  );
};

export default PoliciesAccordion;
