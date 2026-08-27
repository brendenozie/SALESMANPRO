// app/stores/layout.tsx
import React from 'react';

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-b from-gray-100 to-gray-50 dark:bg-gray-900 dark:bg-gradient-to-b dark:from-gray-800 dark:to-gray-900">
        {children}
    </div>
  );
}
