"use client";

import React, { useState } from "react";
import { TemplateDefinition } from "@/types/website-builder";

interface TemplateDiagnosticHudProps {
  slug: string;
  template: TemplateDefinition;
  pageSlug?: string;
  hasPublishedConfig: boolean;
  sectionsCount?: number;
  category?: string;
  variant?: string;
  isEditor?: boolean;
  isPreviewMode?: boolean;
  selectedTargetId?: string | null;
  selectedComponentKey?: string | null;
  selectedSectionId?: string | null;
  editabilityStatus?: string | null;
  host?: string;
}

export default function TemplateDiagnosticHud({
  slug,
  template,
  pageSlug = "home",
  hasPublishedConfig,
  sectionsCount = 0,
  category,
  variant,
  isEditor = false,
  isPreviewMode = false,
  selectedTargetId,
  selectedComponentKey,
  selectedSectionId,
  editabilityStatus,
  host,
}: TemplateDiagnosticHudProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ⛔ Production guard — never render on public storefronts in production.
  // This prevents internal template metadata from leaking to visitors.
  if (process.env.NODE_ENV === "production" && !isEditor) {
    return null;
  }

  // In development/staging: additionally require ?debug=template query param or localhost
  if (
    typeof window !== "undefined" &&
    !window.location.search.includes("debug=template") &&
    !window.location.host.includes("localhost")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[99999] font-mono text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-emerald-400 border border-emerald-500/50 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-colors"
          title="Click to view template diagnostics"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Template HUD: {template.id}</span>
        </button>
      ) : (
        <div className="bg-slate-950/95 text-slate-200 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-md w-[380px] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Template Diagnostic HUD
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-base leading-none px-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Tenant:</span>
              <span className="text-white font-medium">{slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Canonical ID:</span>
              <span className="text-emerald-400 font-semibold">{template.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Template Name:</span>
              <span className="text-white">{template.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category / Variant:</span>
              <span className="text-amber-400">{category || "none"} / {variant || "none"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shell Layout:</span>
              <span className="text-blue-400">{template.shellLayout}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Body Component:</span>
              <span className="text-purple-400">{template.bodyComponent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Page:</span>
              <span className="text-white font-medium">{pageSlug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Config Mode:</span>
              <span className={hasPublishedConfig ? "text-emerald-400" : "text-slate-400"}>
                {hasPublishedConfig ? "Published Snapshot" : "Direct Template Default"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authentic Sections:</span>
              <span className="text-white">{sectionsCount || template.authenticSections.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Capabilities:</span>
              <span className="text-slate-300 truncate max-w-[200px] text-right">
                {template.capabilities.join(", ")}
              </span>
            </div>
            {isEditor && (
              <>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Editor Interaction State
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interaction Mode:</span>
                  <span className={isPreviewMode ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                    {isPreviewMode ? "Preview / Interact" : "Edit Mode (Intercept Active)"}
                  </span>
                </div>
                {selectedTargetId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target ID:</span>
                    <span className="text-rose-400 truncate max-w-[180px]">{selectedTargetId}</span>
                  </div>
                )}
                {selectedComponentKey && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Component:</span>
                    <span className="text-cyan-400">{selectedComponentKey}</span>
                  </div>
                )}
                {selectedSectionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Section:</span>
                    <span className="text-white">{selectedSectionId}</span>
                  </div>
                )}
                {editabilityStatus && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Editability:</span>
                    <span className={
                      editabilityStatus === "FULLY_EDITABLE"
                        ? "text-emerald-400"
                        : editabilityStatus === "PARTIALLY_EDITABLE"
                        ? "text-amber-400"
                        : "text-slate-400"
                    }>
                      {editabilityStatus}
                    </span>
                  </div>
                )}
                {host && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Host:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{host}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            SalesmanPro Forensic Multi-Tenant Engine
          </div>
        </div>
      )}
    </div>
  );
}
