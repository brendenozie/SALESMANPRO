"use client";

import React, { useState } from "react";
import { XMarkIcon, ClockIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
  revisions: any[];
  onRestored: (restoredConfig: any) => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  storeSlug,
  revisions = [],
  onRestored,
}: VersionHistoryModalProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRollback = async (revisionId: string) => {
    if (!confirm("Restore this published revision into your working draft? Any unsaved edits in your current draft will be replaced.")) {
      return;
    }

    setRestoringId(revisionId);
    try {
      const res = await fetch(`/api/website-builder/${storeSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ROLLBACK",
          revisionId,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to rollback revision.");
      }

      onRestored(json.data.config);
      toast.success("Revision restored into your working draft!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to restore revision.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                Website Version History
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Every publish creates a permanent revision. You can safely restore any past snapshot.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Revisions List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {revisions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No previous revisions found yet. Published versions will appear here.
            </div>
          ) : (
            revisions.map((rev, idx) => {
              const isCurrent = idx === 0;
              const dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleString() : "Recent";

              return (
                <div
                  key={rev.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-white dark:hover:bg-zinc-800/60 transition gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        Version {rev.versionNumber}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active Published
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {rev.source || "MANUAL"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                      {rev.changeSummary || "Published updates"}
                    </p>

                    <p className="text-[11px] text-zinc-400">
                      {dateStr}
                    </p>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRollback(rev.id)}
                      disabled={restoringId === rev.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition"
                    >
                      <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                      <span>{restoringId === rev.id ? "Restoring..." : "Restore"}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
