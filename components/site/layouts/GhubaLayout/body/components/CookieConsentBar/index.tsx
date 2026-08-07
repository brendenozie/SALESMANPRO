'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

const defaultPrefs = {
  functional: true,
  analytics: false,
  marketing: false,
};

type CookiePrefs = typeof defaultPrefs;

export default function CookieConsentBar({
  onConsentChange,
}: {
  onConsentChange?: (prefs: CookiePrefs | null) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>(defaultPrefs);
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookiePrefs');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPrefs(parsed);
      onConsentChange?.(parsed);
    } else {
      setVisible(true);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('cookiePrefs', JSON.stringify(prefs));
    setVisible(false);
    onConsentChange?.(prefs);
  };

  const handleAcceptAll = () => {
    const allTrue = { functional: true, analytics: true, marketing: true };
    setPrefs(allTrue);
    localStorage.setItem('cookiePrefs', JSON.stringify(allTrue));
    setVisible(false);
    onConsentChange?.(allTrue);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 left-4 right-4 md:left-10 md:right-10 z-[9800] max-w-4xl mx-auto"
        >
          <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl px-6 py-5">
            <div className="flex items-start gap-3 text-sm text-gray-700 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-rose-500" />
              <span>
                We use cookies to enhance your experience. Manage your preferences below or accept all cookies.
              </span>
            </div>

            {customizing && (
              <div className="grid gap-3 mb-4">
                {Object.entries(prefs).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setPrefs((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                    />
                    <span className="capitalize text-sm text-gray-800">{key} cookies</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setCustomizing((prev) => !prev)}
                className="px-4 py-2 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                {customizing ? 'Back' : 'Customize'}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium rounded-full bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
