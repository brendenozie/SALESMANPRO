"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

type TicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm?: () => void;
  icon?: React.ReactNode;
};

export default function TicketModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  onConfirm,
  icon,
}: TicketModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                {icon || (
                  <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                )}
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>

              {description && (
                <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {isLoading && (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  )}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
