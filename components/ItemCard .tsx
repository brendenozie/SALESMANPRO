// components/ui/ItemCard.tsx
import React, { ReactNode } from 'react';

export const ItemCard = ({ children, onRemove }: {
  children: ReactNode;
  onRemove: () => void;
}) => (
  <div className="relative p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-3">
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition text-lg leading-none"
      aria-label="Remove item"
    >
      ×
    </button>
    {children}
  </div>
);
