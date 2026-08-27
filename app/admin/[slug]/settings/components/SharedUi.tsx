'use client';

import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  Icon: React.ElementType;
  readOnly?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ id, label, type = 'text', value, onChange, Icon, readOnly = false, ...props }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type={type}
        id={id}
        className={clsx(
          "w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all outline-none text-sm",
          readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'
        )}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        {...props}
      />
    </div>
    {readOnly && <p className="mt-1 text-xs text-gray-400">Contact platform support to alter this registry field.</p>}
  </div>
);

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({ id, label, description, checked, onChange }) => (
  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-start justify-between transition-colors hover:bg-gray-50">
    <div className="mr-4">
      <label htmlFor={id} className="text-base font-semibold text-gray-900 cursor-pointer">{label}</label>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
    <input
      type="checkbox"
      id={id}
      className="h-6 w-6 rounded-full border-gray-300 bg-gray-200 text-[var(--primary-color)] focus:ring-[var(--primary-color)] mt-1 flex-shrink-0 cursor-pointer"
      checked={checked}
      onChange={onChange}
    />
  </div>
);

export const SaveButton: React.FC<{ label: string; loading?: boolean }> = ({ label, loading }) => (
  <div className="pt-6 border-t border-gray-100">
    <motion.button
      type="submit"
      disabled={loading}
      className="w-full px-6 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50
                 transition-all duration-300 hover:bg-[var(--primary-color-hover)] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      {loading ? 'Processing Operation...' : label}
    </motion.button>
  </div>
);