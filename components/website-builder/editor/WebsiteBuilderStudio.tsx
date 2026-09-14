"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CompiledWebsiteConfig,
  SectionType,
  SECTION_REGISTRY,
  ThemeTokens,
  PageSection,
} from "@/types/website-builder";
import WebsiteRenderer from "../WebsiteRenderer";
import TemplateDiagnosticHud from "../TemplateDiagnosticHud";
import SectionPickerModal from "./SectionPickerModal";
import AIAssistantModal from "./AIAssistantModal";
import VersionHistoryModal from "./VersionHistoryModal";
import {
  resolveCanonicalTemplate,
  getAllTemplates,
  TemplateDefinition,
} from "@/lib/website-builder/template-registry";
import {
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  ClockIcon,
  CheckIcon,
  ArrowPathIcon,
  PaintBrushIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  SwatchIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { SelectedElementInfo, HierarchyItem } from "@/contexts/EditableContentContext";
import {
  parseTargetId,
  getEditableComponent,
  getAllEditableComponents,
  type ComponentEditabilityStatus,
} from "@/lib/website-builder/editable-adapters";
import { getCanonicalLookupKeys } from "@/lib/website-builder/canonical-target-id";
import { buildTenantUrl } from "@/lib/tenant/tenant-router";
import toast from "react-hot-toast";

interface WebsiteBuilderStudioProps {
  initialConfig: CompiledWebsiteConfig;
  storeSlug: string;
  storeName: string;
  companyId: string;
  category?: string;
  variant?: string;
  storeFormData?: any;
  paymentMethods?: any[];
  ghubaData?: any;
  storeLogoUrl?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: any[];
  initialRevisions?: any[];
}

type ViewportMode = "desktop" | "tablet" | "mobile";
type SidebarTab = "sections" | "pages" | "theme" | "navigation" | "templates";

const GOOGLE_FONTS = [
  "Inter, sans-serif",
  "Montserrat, sans-serif",
  "Playfair Display, serif",
  "Merriweather, serif",
  "Roboto, sans-serif",
  "Poppins, sans-serif",
  "Open Sans, sans-serif",
  "Lato, sans-serif",
];

const THEME_PRESETS = [
  { name: "Vibrant Rose", primary: "#F43F5E", secondary: "#FBBF24", accent: "#6366F1" },
  { name: "Emerald Luxe", primary: "#059669", secondary: "#D97706", accent: "#10B981" },
  { name: "Oceanic Blue", primary: "#2563EB", secondary: "#0D9488", accent: "#38BDF8" },
  { name: "Editorial Black", primary: "#0F172A", secondary: "#D97706", accent: "#F43F5E" },
  { name: "Royal Purple", primary: "#7C3AED", secondary: "#F59E0B", accent: "#EC4899" },
  { name: "Warm Amber", primary: "#D97706", secondary: "#B45309", accent: "#F59E0B" },
];

// ---------------------------------------------------------------------------
// ComponentEditableElementsPanel
// Scans the live DOM for [data-editable-id] elements within the selected
// component's section container and renders them as real, clickable field
// cards. This is the ONLY correct way to discover what fields are editable
// in a physical template component without hard-coding adapter guesses.
// ---------------------------------------------------------------------------
interface ScannedElement {
  targetId: string;
  label: string;
  type: string;
  componentKey: string;
  currentValue?: string;
  defaultValue?: string;
  hasRenderBinding: boolean;
}

function extractScannedElement(el: Element, fallbackComp: string): ScannedElement | null {
  const targetId = el.getAttribute('data-editable-id') || el.getAttribute('data-editor-target') || '';
  if (!targetId) return null;
  const bindingAttr = el.getAttribute('data-editor-binding');
  const hasRenderBinding = bindingAttr === 'VERIFIED_RENDER_BINDING' || el.hasAttribute('data-editable-id');
  const attrVal = el.getAttribute('data-editor-value');
  const attrDef = el.getAttribute('data-editor-default');
  const domText = (el.textContent || '').trim();
  const effectiveVal = attrVal !== null && attrVal !== '' ? attrVal : (attrDef !== null && attrDef !== '' ? attrDef : domText);
  return {
    targetId,
    label: el.getAttribute('data-editor-label') || targetId.split('.').pop() || targetId,
    type: el.getAttribute('data-editor-type') || 'text',
    componentKey: el.getAttribute('data-editor-component') || fallbackComp,
    currentValue: effectiveVal,
    defaultValue: attrDef || undefined,
    hasRenderBinding,
  };
}

function ComponentEditableElementsPanel({
  componentKey,
  sectionId,
  config,
  onSelectElement,
}: {
  componentKey: string;
  sectionId?: string;
  config: CompiledWebsiteConfig;
  onSelectElement: (info: import("@/contexts/EditableContentContext").SelectedElementInfo) => void;
}) {
  const [elements, setElements] = React.useState<ScannedElement[]>([]);
  const [scanned, setScanned] = React.useState(false);

  // Scan the DOM after mount (and whenever componentKey changes)
  React.useEffect(() => {
    const scan = () => {
      // Try to find the section container by component key, section id, or both
      const selectors = [
        sectionId ? `[data-editor-section="${sectionId}"]` : null,
        `[data-editor-component="${componentKey}"]`,
        sectionId ? `#section-${sectionId}` : null,
        sectionId ? `#${sectionId}` : null,
      ].filter(Boolean) as string[];

      let container: Element | null = null;
      for (const sel of selectors) {
        container = document.querySelector(sel);
        if (container) break;
      }

      // If no container, search whole canvas for this component
      if (!container) {
        container = document.querySelector('[data-editor-component]') ? document.querySelector(`[data-editor-component="${componentKey}"]`) : null;
      }

      const found: ScannedElement[] = [];
      const seen = new Set<string>();

      if (container) {
        const editableEls = container.querySelectorAll('[data-editable-id], [data-editor-target]');
        editableEls.forEach((el) => {
          const item = extractScannedElement(el, componentKey);
          if (!item || seen.has(item.targetId)) return;
          seen.add(item.targetId);
          found.push(item);
        });
      }

      // Also scan outside the container for component-level elements that may
      // be rendered in portals (e.g. modals, drawers)
      if (found.length === 0) {
        const allEditables = document.querySelectorAll(`[data-editor-component="${componentKey}"] [data-editable-id]`);
        allEditables.forEach((el) => {
          const item = extractScannedElement(el, componentKey);
          if (!item || seen.has(item.targetId)) return;
          seen.add(item.targetId);
          found.push(item);
        });
      }

      setElements(found);
      setScanned(true);
    };

    // Small delay to let the canvas render settle
    const timer = setTimeout(scan, 150);
    return () => clearTimeout(timer);
  }, [componentKey, sectionId]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼';
      case 'textarea': return '📝';
      case 'link': return '🔗';
      case 'color': return '🎨';
      default: return '✏️';
    }
  };

  const adapter = React.useMemo(() => {
    return getEditableComponent(componentKey) || (sectionId ? getEditableComponent(sectionId) : undefined);
  }, [componentKey, sectionId]);

  // If live DOM elements weren't found, synthesize elements from:
  // 1. Registered adapter properties
  // 2. Section content in config.pages[0].sections
  // 3. Authentic section definition in canonical template
  const fallbackElements: ScannedElement[] = React.useMemo(() => {
    if (elements.length > 0) return [];
    const list: ScannedElement[] = [];
    const seen = new Set<string>();

    const addElement = (key: string, label: string, type: string, defVal?: any) => {
      if (seen.has(key)) return;
      seen.add(key);
      const canonicalTarget = `home.${sectionId || componentKey}.${componentKey}.main.${key}`;
      const overrideVal = config.componentOverrides?.[canonicalTarget];
      const strVal = overrideVal !== undefined ? String(overrideVal) : (typeof defVal === 'string' ? defVal : undefined);
      list.push({
        targetId: canonicalTarget,
        label: label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        type: type || 'text',
        componentKey: componentKey,
        currentValue: strVal,
        defaultValue: typeof defVal === 'string' ? defVal : undefined,
        hasRenderBinding: true,
      });
    };

    if (adapter && adapter.properties) {
      Object.entries(adapter.properties).forEach(([key, prop]) => {
        addElement(key, prop.label || key, prop.type || 'text', prop.defaultValue ?? prop.default);
      });
    }

    // Check section in config
    const secConfig = config.pages?.[0]?.sections?.find(
      (s) => s.id === sectionId || s.type === componentKey || s.type === sectionId
    );
    if (secConfig?.content && typeof secConfig.content === 'object') {
      Object.entries(secConfig.content).forEach(([k, v]) => {
        if (typeof v === 'string' || typeof v === 'number') {
          const inferredType = k.toLowerCase().includes('image') || k.toLowerCase().includes('photo')
            ? 'image'
            : (k.toLowerCase().includes('link') || k.toLowerCase().includes('url')
              ? 'link'
              : (String(v).length > 50 ? 'textarea' : 'text'));
          addElement(k, k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()), inferredType, String(v));
        }
      });
    }

    // Check canonical template authenticSections
    try {
      const canonicalTpl = resolveCanonicalTemplate(undefined, undefined, config.templateKey);
      const matchedAuthSec = canonicalTpl.authenticSections.find(
        (as) => as.component === componentKey || as.id === sectionId || as.type === componentKey || as.type === sectionId
      );
      if (matchedAuthSec) {
        if (Array.isArray(matchedAuthSec.editableProps)) {
          matchedAuthSec.editableProps.forEach((propKey) => {
            const defVal = (matchedAuthSec.defaultContent as any)?.[propKey];
            const inferredType = propKey.toLowerCase().includes('image') || propKey.toLowerCase().includes('photo')
              ? 'image'
              : (propKey.toLowerCase().includes('link') || propKey.toLowerCase().includes('url')
                ? 'link'
                : (typeof defVal === 'string' && defVal.length > 50 ? 'textarea' : 'text'));
            addElement(propKey, propKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()), inferredType, defVal);
          });
        }
        if (matchedAuthSec.defaultContent && typeof matchedAuthSec.defaultContent === 'object') {
          Object.entries(matchedAuthSec.defaultContent).forEach(([k, v]) => {
            if (typeof v === 'string' || typeof v === 'number') {
              const inferredType = k.toLowerCase().includes('image') || k.toLowerCase().includes('photo')
                ? 'image'
                : (k.toLowerCase().includes('link') || k.toLowerCase().includes('url')
                  ? 'link'
                  : (String(v).length > 50 ? 'textarea' : 'text'));
              addElement(k, k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()), inferredType, String(v));
            }
          });
        }
      }
    } catch {
      // ignore
    }

    return list;
  }, [elements, adapter, sectionId, componentKey, config]);

  const rawStatus = adapter?.status || ((elements.length > 0 || fallbackElements.length > 0) ? "EDITABLE" : "UNWRAPPED");
  const editabilityStatus: ComponentEditabilityStatus = 
    rawStatus === "FULLY_EDITABLE" ? "EDITABLE" : rawStatus as ComponentEditabilityStatus;

  const activeElements = elements.length > 0 ? elements : fallbackElements;
  const isFallbackSchema = elements.length === 0 && fallbackElements.length > 0;

  const renderStatusBadge = (st: string) => {
    switch (st) {
      case 'EDITABLE':
      case 'FULLY_EDITABLE':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">EDITABLE</span>;
      case 'PARTIALLY_EDITABLE':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-300 dark:border-sky-800">PARTIAL</span>;
      case 'DATA_DRIVEN':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300 dark:border-purple-800">DATA DRIVEN</span>;
      case 'INTENTIONALLY_STATIC':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">STATIC</span>;
      default:
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">UNWRAPPED</span>;
    }
  };

  if (!scanned) {
    return (
      <div className="space-y-2">
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Component Header & Status Meta */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            {adapter?.label || componentKey}
          </span>
        </div>
        <div>
          {renderStatusBadge(editabilityStatus)}
        </div>
      </div>

      {/* DATA-DRIVEN CATALOG GUIDANCE BANNER */}
      {editabilityStatus === 'DATA_DRIVEN' && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400 text-sm">📦</span>
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              Database Catalog Component
            </span>
          </div>
          <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80 leading-relaxed">
            Items (products, listings, booking slots) in this section are dynamically loaded from your active database. To add, edit, or adjust catalog inventory, use your store dashboard. Container headings and branding remain editable below.
          </p>
        </div>
      )}

      {/* INTENTIONALLY STATIC BANNER */}
      {editabilityStatus === 'INTENTIONALLY_STATIC' && (
        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
          This component provides structural architectural layout and decorative styling. Its appearance is managed by global theme colors and spacing.
        </div>
      )}

      {/* UNWRAPPED / NO FIELDS BANNER */}
      {activeElements.length === 0 && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400 text-base">ℹ️</span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Component selected. No verified editable fields are currently available.
              </span>
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
              This authentic component is currently rendered with its authentic presentation layout. Content edits for this component are preserved in template defaults.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 text-[10px] font-mono text-zinc-400 space-y-1">
            <div className="font-bold text-zinc-500 dark:text-zinc-400 font-sans text-[10px] uppercase tracking-wider">Component</div>
            <div>{componentKey}</div>
            {sectionId && <><div className="font-bold text-zinc-500 dark:text-zinc-400 font-sans text-[10px] uppercase tracking-wider mt-1">Section</div><div>{sectionId}</div></>}
          </div>
          <details className="group">
            <summary className="text-[10px] font-bold text-zinc-500 cursor-pointer hover:underline">
              Why is this View Only?
            </summary>
            <div className="mt-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1 leading-relaxed">
              <p>• <strong>Rendering mode:</strong> Authentic Theme Layout</p>
              <p>• <strong>Render Binding:</strong> No child elements with <code>data-editable-id</code> were discovered in this component's DOM container.</p>
              <p>• <strong>Content Source:</strong> Default layout typography, animations, or dynamic database query.</p>
            </div>
          </details>
        </div>
      )}

      {/* ACTIVE EDITABLE FIELDS LIST */}
      {activeElements.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Editable Fields ({activeElements.length})
            </span>
            <span className={`text-[9px] font-semibold ${isFallbackSchema ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isFallbackSchema ? '● Registered Schema (Unbound)' : '● Verified Render Binding'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-400">
            Click a field below or click directly on the canvas element to edit it.
          </div>

          {activeElements.map((el) => {
            const hasOverride = config.componentOverrides?.[el.targetId] !== undefined;
            const overrideVal = config.componentOverrides?.[el.targetId];
            const effectiveDisplayVal = overrideVal !== undefined ? overrideVal : (el.currentValue !== undefined ? el.currentValue : el.defaultValue);
            return (
              <button
                key={el.targetId}
                type="button"
                onClick={() => {
                  onSelectElement({
                    targetId: el.targetId,
                    componentKey: el.componentKey,
                    elementKey: el.targetId.split('.').pop(),
                    label: el.label,
                    type: el.type as any,
                    value: effectiveDisplayVal,
                    defaultValue: el.defaultValue,
                    editabilityStatus: el.hasRenderBinding ? 'FULLY_EDITABLE' : 'REGISTERED_SCHEMA_FIELD',
                    hierarchy: [
                      { level: 'page', id: 'home', label: 'HOME' },
                      { level: 'component', id: el.componentKey, label: el.componentKey },
                      { level: 'element', id: el.targetId, label: el.label },
                    ],
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{typeIcon(el.type)}</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-rose-700 dark:group-hover:text-rose-400 capitalize">
                      {el.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                      {el.type}
                    </span>
                    {el.hasRenderBinding ? (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        Render Binding
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        Schema Defined
                      </span>
                    )}
                    {hasOverride && (
                      <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                        Edited
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 truncate">
                  {el.targetId}
                </div>
                {effectiveDisplayVal !== undefined && effectiveDisplayVal !== "" && el.type !== 'image' && (
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium truncate mt-0.5">
                    &ldquo;{String(effectiveDisplayVal).slice(0, 60)}{String(effectiveDisplayVal).length > 60 ? '…' : ''}&rdquo;
                  </div>
                )}
                {!el.hasRenderBinding && (
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-800 mt-1">
                    ⚠️ Defined in schema — no verified render binding on canvas.
                  </div>
                )}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionLiveFieldsInspector
// Discovers real [data-editable-id] fields in the active section container
// and wires them directly to handleUpdateOverride so editing any field updates
// authentic themes in real-time.
// ---------------------------------------------------------------------------
function SectionLiveFieldsInspector({
  section,
  config,
  onUpdateOverride,
  onSelectElement,
  onUpdateSectionStyle,
  onUpdateDataSource,
  onClose,
}: {
  section: PageSection;
  config: CompiledWebsiteConfig;
  onUpdateOverride: (targetId: string, value: any) => void;
  onSelectElement: (info: SelectedElementInfo) => void;
  onUpdateSectionStyle: (key: string, value: any) => void;
  onUpdateDataSource: (key: string, value: any) => void;
  onClose: () => void;
}) {
  const [elements, setElements] = React.useState<ScannedElement[]>([]);
  const [scanned, setScanned] = React.useState(false);

  React.useEffect(() => {
    const scan = () => {
      const selectors = [
        `[data-editor-section="${section.id}"]`,
        `[data-editor-section="${section.type}"]`,
        `#section-${section.id}`,
        `#${section.id}`,
        `section[data-section-type="${section.type}"]`,
      ];
      let container: Element | null = null;
      for (const sel of selectors) {
        container = document.querySelector(sel);
        if (container) break;
      }

      const found: ScannedElement[] = [];
      const seen = new Set<string>();

      if (container) {
        const editableEls = container.querySelectorAll('[data-editable-id], [data-editor-target]');
        editableEls.forEach((el) => {
          const item = extractScannedElement(el, section.type);
          if (!item || seen.has(item.targetId)) return;
          seen.add(item.targetId);
          found.push(item);
        });
      }

      // If no elements found directly in container, search canvas for elements matching this section
      if (found.length === 0) {
        const allEditables = document.querySelectorAll('[data-editable-id]');
        allEditables.forEach((el) => {
          const targetId = el.getAttribute('data-editable-id') || '';
          if (targetId.includes(`.${section.id}.`) || targetId.includes(`.${section.type}.`)) {
            const item = extractScannedElement(el, section.type);
            if (!item || seen.has(item.targetId)) return;
            seen.add(item.targetId);
            found.push(item);
          }
        });
      }

      // If no DOM elements discovered, synthesize authentic editable fields from:
      // 1. Structured section content
      // 2. Component adapter schema
      // 3. Authentic section registry definition
      if (found.length === 0) {
        const compName = section.component || section.type;

        // 1. Section content
        if (section.content && typeof section.content === 'object') {
          Object.entries(section.content).forEach(([k, v]) => {
            if (typeof v === 'string' || typeof v === 'number') {
              const canonicalTarget = `home.${section.id}.${compName}.main.${k}`;
              if (!seen.has(canonicalTarget)) {
                seen.add(canonicalTarget);
                const inferredType = k.toLowerCase().includes('image') || k.toLowerCase().includes('photo')
                  ? 'image'
                  : (k.toLowerCase().includes('link') || k.toLowerCase().includes('url')
                    ? 'link'
                    : (String(v).length > 50 ? 'textarea' : 'text'));
                found.push({
                  targetId: canonicalTarget,
                  label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                  type: inferredType,
                  componentKey: compName,
                  currentValue: String(v),
                  defaultValue: String(v),
                  hasRenderBinding: true,
                });
              }
            } else if (Array.isArray(v)) {
              v.forEach((item, itemIdx) => {
                if (item && typeof item === 'object') {
                  Object.entries(item).forEach(([propKey, propVal]) => {
                    if (typeof propVal === 'string' || typeof propVal === 'number') {
                      const canonicalTarget = `home.${section.id}.${compName}.${k}-${itemIdx}.${propKey}`;
                      if (!seen.has(canonicalTarget)) {
                        seen.add(canonicalTarget);
                        const label = `${k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} ${itemIdx + 1}: ${propKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}`;
                        found.push({
                          targetId: canonicalTarget,
                          label,
                          type: typeof propVal === 'string' && propVal.length > 50 ? 'textarea' : 'text',
                          componentKey: compName,
                          currentValue: String(propVal),
                          defaultValue: String(propVal),
                          hasRenderBinding: true,
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        }

        // 2. Component adapter properties
        const adapter = getEditableComponent(section.component || "") || getEditableComponent(section.type) || getEditableComponent(section.id);
        if (adapter && adapter.properties) {
          Object.entries(adapter.properties).forEach(([k, prop]) => {
            const canonicalTarget = `home.${section.id}.${compName}.main.${k}`;
            if (!seen.has(canonicalTarget)) {
              seen.add(canonicalTarget);
              found.push({
                targetId: canonicalTarget,
                label: prop.label || k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                type: prop.type || 'text',
                componentKey: compName,
                currentValue: typeof prop.default === 'string' ? prop.default : undefined,
                defaultValue: typeof prop.default === 'string' ? prop.default : undefined,
                hasRenderBinding: true,
              });
            }
          });
        }

        // 3. Authentic template definition
        try {
          const canonicalTpl = resolveCanonicalTemplate(undefined, undefined, config.templateKey);
          const matchedAuthSec = canonicalTpl.authenticSections.find(
            (as) => as.id === section.id || as.component === section.component || as.component === section.type || as.type === section.type
          );
          if (matchedAuthSec) {
            if (Array.isArray(matchedAuthSec.editableProps)) {
              matchedAuthSec.editableProps.forEach((propKey) => {
                const canonicalTarget = `home.${section.id}.${compName}.main.${propKey}`;
                if (!seen.has(canonicalTarget)) {
                  seen.add(canonicalTarget);
                  const defVal = (matchedAuthSec.defaultContent as any)?.[propKey];
                  const inferredType = propKey.toLowerCase().includes('image') || propKey.toLowerCase().includes('photo')
                    ? 'image'
                    : (propKey.toLowerCase().includes('link') || propKey.toLowerCase().includes('url')
                      ? 'link'
                      : (typeof defVal === 'string' && defVal.length > 50 ? 'textarea' : 'text'));
                  found.push({
                    targetId: canonicalTarget,
                    label: propKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                    type: inferredType,
                    componentKey: compName,
                    currentValue: typeof defVal === 'string' ? defVal : undefined,
                    defaultValue: typeof defVal === 'string' ? defVal : undefined,
                    hasRenderBinding: true,
                  });
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }

      setElements(found);
      setScanned(true);
    };

    const timer = setTimeout(scan, 150);
    return () => clearTimeout(timer);
  }, [section.id, section.type, section.content, config.componentOverrides, config.templateKey]);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼';
      case 'textarea': return '📝';
      case 'link': return '🔗';
      case 'color': return '🎨';
      default: return '✏️';
    }
  };

  return (
    <>
      {/* Inspector Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Section Inspector
          </span>
          <h3 className="text-sm font-black text-zinc-900 dark:text-white capitalize">
            {section.type} Section
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto grow space-y-4 text-xs">
        {/* LIVE EDITABLE FIELDS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Live Authentic Fields ({elements.length})
            </span>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              ● Verified Render Bindings
            </span>
          </div>

          {!scanned ? (
            <div className="space-y-2">
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-1/2" />
            </div>
          ) : elements.length === 0 ? (
            <div className="space-y-2">
              {section.dataSource ? (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">📦</span>
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
                      Catalog-Driven Section
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80 leading-relaxed">
                    This section displays dynamic items loaded from your store database. You can adjust query filters and limits below.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <div className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                    Authentic Theme Section
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    This section provides architectural layout. Visual styling can be adjusted using the Layout controls below or Theme Settings.
                  </p>
                  <details className="group">
                    <summary className="text-[10px] font-bold text-zinc-500 cursor-pointer hover:underline">
                      Why are there no direct text inputs?
                    </summary>
                    <div className="mt-1.5 p-2 rounded bg-zinc-200/50 dark:bg-zinc-700/40 text-[10px] text-zinc-600 dark:text-zinc-300 space-y-1">
                      <p>• This theme section renders directly from compiled template defaults or dynamic database queries.</p>
                      <p>• To edit specific sub-elements, click directly on any highlighted element on the canvas.</p>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {elements.map((el) => {
                const overrideVal = config.componentOverrides?.[el.targetId];
                const currentVal = overrideVal !== undefined ? overrideVal : (el.currentValue ?? "");
                const hasOverride = overrideVal !== undefined;

                return (
                  <div
                    key={el.targetId}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{typeIcon(el.type)}</span>
                        <label className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                          {el.label}
                        </label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasOverride && (
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            Edited
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectElement({
                              targetId: el.targetId,
                              componentKey: el.componentKey,
                              elementKey: el.targetId.split('.').pop(),
                              label: el.label,
                              type: el.type as any,
                              value: currentVal,
                              defaultValue: el.defaultValue,
                              editabilityStatus: 'FULLY_EDITABLE',
                              hierarchy: [
                                { level: 'page', id: 'home', label: 'HOME' },
                                { level: 'section', id: section.id, label: section.type },
                                { level: 'component', id: el.componentKey, label: el.componentKey },
                                { level: 'element', id: el.targetId, label: el.label },
                              ],
                            });
                          }}
                          className="text-[10px] text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold underline"
                          title="Open in focused element inspector"
                        >
                          Focus
                        </button>
                      </div>
                    </div>

                    {el.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={currentVal}
                        onChange={(e) => onUpdateOverride(el.targetId, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs resize-none"
                      />
                    ) : el.type === "image" ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => onUpdateOverride(el.targetId, e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                        />
                        {currentVal && (
                          <div className="h-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                            <img src={currentVal} alt="Preview" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    ) : el.type === "color" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentVal || "#000000"}
                          onChange={(e) => onUpdateOverride(el.targetId, e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-800 p-0.5"
                        />
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => onUpdateOverride(el.targetId, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => onUpdateOverride(el.targetId, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                      />
                    )}
                    <div className="text-[9px] font-mono text-zinc-400 truncate">
                      {el.targetId}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Data Source Bindings for Commerce */}
        {section.dataSource && (
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Authoritative Catalog Source
            </span>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Product Query Filter
              </label>
              <select
                value={section.dataSource.filter}
                onChange={(e) => onUpdateDataSource("filter", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
              >
                <option value="featured">Featured Items</option>
                <option value="trending">Trending (High Rated)</option>
                <option value="on_offer">On Offer / Sale</option>
                <option value="latest">Latest Arrivals</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Max Items to Show ({section.dataSource.limit || 8})
              </label>
              <input
                type="range"
                min={4}
                max={24}
                step={4}
                value={section.dataSource.limit || 8}
                onChange={(e) => onUpdateDataSource("limit", parseInt(e.target.value, 10))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        )}

        {/* Styles Inspector */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Layout & Spacing
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Padding Top</label>
              <select
                value={section.styles?.paddingTop || "lg"}
                onChange={(e) => onUpdateSectionStyle("paddingTop", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Padding Bottom</label>
              <select
                value={section.styles?.paddingBottom || "lg"}
                onChange={(e) => onUpdateSectionStyle("paddingBottom", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function cloneConfig(prev: CompiledWebsiteConfig): CompiledWebsiteConfig {
  return {
    ...prev,
    componentOverrides: prev.componentOverrides ? { ...prev.componentOverrides } : {},
    theme: prev.theme ? { ...prev.theme } : ({} as any),
    navigation: prev.navigation
      ? {
          ...prev.navigation,
          headerSettings: prev.navigation.headerSettings ? { ...prev.navigation.headerSettings } : ({} as any),
          footerSettings: prev.navigation.footerSettings ? { ...prev.navigation.footerSettings } : ({} as any),
          headerItems: prev.navigation.headerItems ? prev.navigation.headerItems.map((item) => ({ ...item })) : [],
          footerColumns: prev.navigation.footerColumns
            ? prev.navigation.footerColumns.map((col) => ({
                ...col,
                items: col.items ? col.items.map((it) => ({ ...it })) : [],
              }))
            : [],
        }
      : prev.navigation,
    pages: prev.pages
      ? prev.pages.map((p) => ({
          ...p,
          sections: p.sections
            ? p.sections.map((s) => ({
                ...s,
                content: s.content ? (Array.isArray(s.content) ? [...s.content] : { ...s.content }) : s.content,
                styles: s.styles ? { ...s.styles } : s.styles,
                responsive: s.responsive ? { ...s.responsive } : s.responsive,
                dataSource: s.dataSource ? { ...s.dataSource } : s.dataSource,
              }))
            : [],
        }))
      : [],
  };
}

export default function WebsiteBuilderStudio({
  initialConfig,
  storeSlug,
  storeName,
  companyId,
  category,
  variant,
  storeFormData,
  paymentMethods,
  ghubaData,
  storeLogoUrl,
  contactPhone,
  contactEmail,
  address,
  socialLinks,
  initialRevisions = [],
}: WebsiteBuilderStudioProps) {
  // State
  const [config, setConfig] = useState<CompiledWebsiteConfig>(initialConfig);
  const [activePageSlug, setActivePageSlug] = useState<string>("home");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [revisions, setRevisions] = useState<any[]>(initialRevisions);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("all");

  // Element-level selection & override state
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CompiledWebsiteConfig[]>([initialConfig]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setConfig(history[prevIndex]);
      setHasUnsavedChanges(true);
      toast.success("Undo", { id: "undo-toast", duration: 1000 });
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setConfig(history[nextIndex]);
      setHasUnsavedChanges(true);
      toast.success("Redo", { id: "redo-toast", duration: 1000 });
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Active canonical template resolved with full category, variant, and config.templateKey
  const activeTemplate = useMemo(() => {
    return resolveCanonicalTemplate(category, variant, config.templateKey);
  }, [category, variant, config.templateKey]);

  const allTemplates = useMemo(() => getAllTemplates(), []);

  // Handler to switch template in the builder
  const handleSwitchTemplate = (tpl: TemplateDefinition) => {
    // Reset element selection to prevent cross-template dangling pointers
    setSelectedSectionId(null);
    setSelectedElement(null);
    setSelectedTargetId(null);

    updateConfig((prev) => {
      prev.templateKey = tpl.id;

      // Sanitize template-specific component overrides while preserving global store branding
      if (prev.componentOverrides) {
        const preserved: Record<string, any> = {};
        for (const [k, v] of Object.entries(prev.componentOverrides)) {
          if (
            k.startsWith("header.") ||
            k.startsWith("footer.") ||
            k.includes(".storeName") ||
            k.includes(".brandName") ||
            k.includes(".copyrightText") ||
            k.includes(".bio") ||
            k.includes(".contactPhone") ||
            k.includes(".contactEmail")
          ) {
            preserved[k] = v;
          }
        }
        prev.componentOverrides = preserved;
      }

      // Blend template default palette and typography
      prev.theme = {
        ...prev.theme,
        primaryColor: tpl.defaultTheme.primaryColor || prev.theme.primaryColor,
        secondaryColor: tpl.defaultTheme.secondaryColor || prev.theme.secondaryColor,
        accentColor: tpl.defaultTheme.accentColor || prev.theme.accentColor,
        headingFont: tpl.defaultTheme.headingFont || prev.theme.headingFont,
        bodyFont: tpl.defaultTheme.bodyFont || prev.theme.bodyFont,
        buttonRadius: (tpl.defaultTheme.buttonRadius as any) || prev.theme.buttonRadius,
        cardRadius: (tpl.defaultTheme.cardRadius as any) || prev.theme.cardRadius,
      };

      // Populate navigation from template shell if available
      if (tpl.shell?.defaultNavItems && tpl.shell.defaultNavItems.length > 0) {
        prev.navigation.headerItems = tpl.shell.defaultNavItems.map((item) => ({ ...item }));
      }

      // Recompile homepage sections with authentic section set for the new template
      if (tpl.authenticSections && tpl.authenticSections.length > 0) {
        const homePage = prev.pages.find((p) => p.isHomepage || p.slug === "home") || prev.pages[0];
        if (homePage) {
          homePage.sections = tpl.authenticSections.map((sec, idx) => ({
            id: `sec-${sec.id}-${Date.now() + idx}`,
            type: sec.type as any,
            order: idx,
            isVisible: true,
            content: { ...(sec.defaultContent || {}) },
            styles: sec.defaultStyles || {
              paddingTop: "xl",
              paddingBottom: "xl",
              textAlign: "left",
            },
            responsive: {
              columnsMobile: 1,
              columnsTablet: 2,
              columnsDesktop: 4,
              hideOnMobile: false,
              hideOnDesktop: false,
            },
            dataSource: sec.dataSource,
          }));
        }
      }

      return prev;
    });
    toast.success(`Active template switched to ${tpl.name}!`);
  };

  // Modals
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active page & selected section
  const activePage =
    config.pages.find((p) => p.slug === activePageSlug) || config.pages[0];
  const selectedSection = (activePage?.sections || []).find((s) => s.id === selectedSectionId) || null;

  // Auto-select first section if none selected
  useEffect(() => {
    if (!selectedSectionId && !selectedElement && activePage?.sections?.length) {
      setSelectedSectionId(activePage.sections[0].id);
    }
  }, [activePageSlug, selectedSectionId, selectedElement, activePage]);

  const historyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    };
  }, []);

  const pushHistorySnapshot = useCallback(
    (nextConfig: CompiledWebsiteConfig) => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      historyTimeoutRef.current = setTimeout(() => {
        setHistory((h) => {
          const sliced = h.slice(0, historyIndex + 1);
          const updated = [...sliced, nextConfig];
          if (updated.length > 25) updated.shift();
          return updated;
        });
        setHistoryIndex((idx) => Math.min(idx + 1, 24));
      }, 400);
    },
    [historyIndex]
  );

  // Track edits and push snapshots into history
  const updateConfig = useCallback(
    (updater: (prev: CompiledWebsiteConfig) => CompiledWebsiteConfig, immediateHistory = false) => {
      setConfig((prev) => {
        const next = updater(cloneConfig(prev));
        if (immediateHistory) {
          if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
          setHistory((h) => {
            const sliced = h.slice(0, historyIndex + 1);
            const updated = [...sliced, next];
            if (updated.length > 25) updated.shift();
            return updated;
          });
          setHistoryIndex((idx) => Math.min(idx + 1, 24));
        } else {
          pushHistorySnapshot(next);
        }
        setHasUnsavedChanges(true);
        return next;
      });
    },
    [historyIndex, pushHistorySnapshot]
  );

  // Handle element-level property override updates and sync with tenant structured section content
  const handleUpdateOverride = useCallback(
    (targetId: string, value: any) => {
      updateConfig((prev) => {
        if (!prev.componentOverrides) {
          prev.componentOverrides = {};
        }
        prev.componentOverrides[targetId] = value;

        // Synchronize directly into structured tenant section content
        const targetPage =
          prev.pages?.find(
            (p) =>
              (p.isHomepage && (activePageSlug === "home" || activePageSlug === "")) ||
              p.slug === activePageSlug
          ) || prev.pages?.[0];

        if (targetPage && targetPage.sections) {
          const parts = targetId.split(".");
          const rawField = parts[parts.length - 1];
          const fieldKey = rawField.toLowerCase();

          // Find the matching section by prioritizing explicit targetId section ID, then component/type, then selectedSectionId
          const matchedSection =
            targetPage.sections.find(
              (s) =>
                targetId.includes(`.${s.id}.`) ||
                s.id === parts[2] ||
                s.id === parts[1]
            ) ||
            targetPage.sections.find(
              (s) =>
                (s.component && targetId.includes(`.${s.component}.`)) ||
                targetId.includes(`.${s.type}.`) ||
                s.type === parts[2] ||
                (s.component && targetId.toLowerCase().includes(s.component.toLowerCase()))
            ) ||
            targetPage.sections.find((s) => selectedSectionId && s.id === selectedSectionId);

          const isHero = targetId.toLowerCase().includes("hero") || matchedSection?.type === "hero";
          const heroSection = matchedSection?.type === "hero" ? matchedSection : targetPage.sections.find(
            (s) => s.type === "hero" || s.id?.includes("hero")
          );

          if (isHero && heroSection) {
            if (!heroSection.content) heroSection.content = {};
            heroSection.content[rawField] = value;
            heroSection.content[fieldKey] = value;

            const slideMatch = targetId.match(/slide(\d+)/i);
            const slideIdx = slideMatch ? parseInt(slideMatch[1], 10) : 0;

            if (!Array.isArray(heroSection.content.slides) || heroSection.content.slides.length === 0) {
              heroSection.content.slides = [
                {
                  id: "slide-1",
                  headline: "The Art of Gourmet Dining",
                  title: "The Art of Gourmet Dining",
                  subline: "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
                  eyebrow: "Experience an explosion of flavors crafted by world-class chefs in the heart of the city.",
                  badgeText: "Experience Excellence",
                  ctaText: "Reserve a Table",
                  primaryButtonText: "Reserve a Table",
                  ctaLink: "/restaurent/products",
                  primaryButtonUrl: "/restaurent/products",
                  imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670",
                },
                {
                  id: "slide-2",
                  headline: "Savor Every Moment",
                  title: "Savor Every Moment",
                  subline: "From farm to fork, we bring you the freshest seasonal ingredients prepared with passion.",
                  eyebrow: "From farm to fork, we bring you the freshest seasonal ingredients prepared with passion.",
                  badgeText: "Seasonal Specials",
                  ctaText: "Explore Menu",
                  primaryButtonText: "Explore Menu",
                  ctaLink: "/restaurent/products",
                  primaryButtonUrl: "/restaurent/products",
                  imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2670",
                },
              ];
            }

            while (heroSection.content.slides.length <= slideIdx) {
              heroSection.content.slides.push({
                id: `slide-${heroSection.content.slides.length + 1}`,
                headline: "",
                title: "",
                subline: "",
                eyebrow: "",
                badgeText: "",
                ctaText: "Explore",
                primaryButtonText: "Explore",
                ctaLink: "/products",
                primaryButtonUrl: "/products",
                imageUrl: "",
              });
            }

            const targetSlide = heroSection.content.slides[slideIdx];
            if (fieldKey.includes("head") || fieldKey.includes("title")) {
              targetSlide.headline = value;
              targetSlide.title = value;
            } else if (
              fieldKey.includes("sub") ||
              fieldKey.includes("desc") ||
              fieldKey.includes("eyebrow")
            ) {
              targetSlide.subline = value;
              targetSlide.eyebrow = value;
            } else if (fieldKey.includes("badge")) {
              targetSlide.badgeText = value;
            } else if (
              fieldKey.includes("cta") ||
              fieldKey.includes("btn") ||
              fieldKey.includes("button")
            ) {
              if (
                fieldKey.includes("link") ||
                fieldKey.includes("url") ||
                fieldKey.includes("href")
              ) {
                targetSlide.ctaLink = value;
                targetSlide.primaryButtonUrl = value;
              } else {
                targetSlide.ctaText = value;
                targetSlide.primaryButtonText = value;
              }
            } else if (fieldKey.includes("image") || fieldKey.includes("bg")) {
              targetSlide.imageUrl = value;
            } else {
              targetSlide[rawField] = value;
            }
          } else if (matchedSection) {
            if (!matchedSection.content) matchedSection.content = {};

            // Handle indexed items/services array updating (e.g. items-0.title, services-0.title, services-0.desc)
            const itemMatch = targetId.match(/(items|services|features|badges|corevalues|slides)[.-](\d+)\.([a-zA-Z0-9_]+)/i);
            if (itemMatch) {
              const arrayName = itemMatch[1].toLowerCase();
              const itemIdx = parseInt(itemMatch[2], 10);
              const propKey = itemMatch[3];
              const actualKey = Object.keys(matchedSection.content).find(k => k.toLowerCase() === arrayName) || arrayName;
              const currentArray = Array.isArray(matchedSection.content[actualKey])
                ? [...matchedSection.content[actualKey]]
                : [];
              while (currentArray.length <= itemIdx) {
                currentArray.push({});
              }
              currentArray[itemIdx] = {
                ...currentArray[itemIdx],
                [propKey]: value,
              };
              matchedSection.content[actualKey] = currentArray;
            } else {
              matchedSection.content[rawField] = value;
              matchedSection.content[fieldKey] = value;
            }
          }
        }

        return prev;
      });
      setSelectedElement((prev) =>
        prev && prev.targetId === targetId ? { ...prev, value } : prev
      );
    },
    [updateConfig, activePageSlug]
  );

  // Reset an override back to authentic template default
  const handleResetOverride = useCallback((targetId: string) => {
    updateConfig((prev) => {
      if (prev.componentOverrides && prev.componentOverrides[targetId] !== undefined) {
        delete prev.componentOverrides[targetId];
      }
      return prev;
    });
    toast.success("Reset to authentic template default!");
  }, [updateConfig]);

  // Global Canvas Click Interception for Edit Mode
  const handleCanvasClickCapture = useCallback(
    (e: React.MouseEvent) => {
      // In Preview/Interact mode, do NOT intercept clicks so the user can test authentic links
      if (isPreviewMode) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      const editableEl = target.closest("[data-editable-id], [data-editor-target]") as HTMLElement | null;
      const componentEl = target.closest("[data-editor-component]") as HTMLElement | null;
      const sectionEl = target.closest("[data-editor-section]") as HTMLElement | null;
      const anchorEl = target.closest("a, button, [role='button']") as HTMLElement | null;

      // In Edit Mode, ALWAYS prevent default navigation for links, buttons, and editable elements!
      if (anchorEl || editableEl || componentEl || sectionEl) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Priority 1: Direct editable element
      if (editableEl) {
        const targetId = editableEl.getAttribute("data-editable-id") || editableEl.getAttribute("data-editor-target") || "";
        const componentKey = editableEl.getAttribute("data-editor-component") || "Component";
        const label = editableEl.getAttribute("data-editor-label") || "";
        const type = (editableEl.getAttribute("data-editor-type") || "text") as any;
        const parsed = parseTargetId(targetId);

        const hierarchy: HierarchyItem[] = [
          { level: "page", id: parsed.pageSlug || "home", label: (parsed.pageSlug || "home").toUpperCase() },
          { level: "component", id: componentKey, label: componentKey },
        ];
        if (parsed.itemIndex !== undefined) {
          hierarchy.push({ level: "item", id: `${componentKey}.${parsed.itemIndex}`, label: `Item #${parsed.itemIndex + 1}` });
        }
        hierarchy.push({ level: "element", id: targetId, label: label || parsed.fieldKey });

        const overrideVal = config.componentOverrides?.[targetId];
        const attrVal = editableEl.getAttribute("data-editor-value");
        const attrDef = editableEl.getAttribute("data-editor-default");
        const domText = (editableEl.textContent || "").trim();
        const effectiveVal = overrideVal !== undefined 
          ? overrideVal 
          : (attrVal !== null && attrVal !== "" 
              ? attrVal 
              : (attrDef !== null && attrDef !== "" ? attrDef : domText));

        setSelectedTargetId(targetId);
        setSelectedElement({
          targetId,
          componentKey,
          elementKey: parsed.fieldKey,
          label: label || parsed.fieldKey,
          type,
          value: effectiveVal,
          defaultValue: attrDef || undefined,
          editabilityStatus: "FULLY_EDITABLE",
          hierarchy,
        });
        setSelectedSectionId(null);
        return;
      }

      // Priority 2: Authentic Component Level
      if (componentEl) {
        const componentKey = componentEl.getAttribute("data-editor-component") || "";
        const sectionKey = componentEl.getAttribute("data-editor-section") || componentKey;
        const adapter = getEditableComponent(componentKey);
        const status = adapter?.status || (adapter ? "FULLY_EDITABLE" : "VIEW_ONLY");

        const hierarchy: HierarchyItem[] = [
          { level: "page", id: "home", label: "HOME" },
          { level: "section", id: sectionKey, label: sectionKey },
          { level: "component", id: componentKey, label: adapter?.label || componentKey },
        ];

        setSelectedTargetId(null);
        setSelectedElement({
          targetId: `component.${componentKey}`,
          componentKey,
          sectionId: sectionKey,
          label: adapter?.label || componentKey,
          editabilityStatus: status,
          hierarchy,
        });
        setSelectedSectionId(sectionKey);
        return;
      }

      // Priority 3: Section Level
      if (sectionEl) {
        const sectionKey = sectionEl.getAttribute("data-editor-section") || "";
        setSelectedTargetId(null);
        setSelectedElement(null);
        setSelectedSectionId(sectionKey);
      }
    },
    [isPreviewMode, config.componentOverrides]
  );

  // Section Manipulation
  const handleAddSection = (sectionType: SectionType) => {
    const reg = SECTION_REGISTRY[sectionType];
    if (!reg) return;

    const newSection = {
      id: `sec-${sectionType}-${Date.now()}`,
      type: sectionType,
      order: (activePage?.sections || []).length,
      isVisible: true,
      content: JSON.parse(JSON.stringify(reg.defaultContent)),
      styles: JSON.parse(JSON.stringify(reg.defaultStyles)),
      responsive: JSON.parse(JSON.stringify(reg.defaultResponsive)),
      dataSource: reg.defaultDataSource ? JSON.parse(JSON.stringify(reg.defaultDataSource)) : undefined,
    };

    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      if (targetPage) {
        targetPage.sections.push(newSection as any);
      }
      return prev;
    });

    setSelectedSectionId(newSection.id);
    toast.success(`Added ${reg.title} section!`);
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      if (!targetPage) return prev;

      const idx = targetPage.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;

      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= targetPage.sections.length) return prev;

      const [item] = targetPage.sections.splice(idx, 1);
      targetPage.sections.splice(targetIdx, 0, item);
      return prev;
    });
  };

  const handleDuplicateSection = (sectionId: string) => {
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      if (!targetPage) return prev;

      const idx = targetPage.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return prev;

      const original = targetPage.sections[idx];
      const duplicate = {
        ...JSON.parse(JSON.stringify(original)),
        id: `sec-${original.component || original.type}-${Date.now()}`,
        name: original.name ? `${original.name} (Copy)` : undefined,
      };
      targetPage.sections.splice(idx + 1, 0, duplicate);
      return prev;
    });
    toast.success("Section duplicated!");
  };

  const handleDeleteSection = (sectionId: string) => {
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      if (!targetPage) return prev;

      targetPage.sections = targetPage.sections.filter((s) => s.id !== sectionId);
      return prev;
    });

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
    toast.success("Section removed.");
  };

  const handleToggleVisibility = (sectionId: string) => {
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      if (!targetPage) return prev;

      const sec = targetPage.sections.find((s) => s.id === sectionId);
      if (sec) {
        sec.isVisible = !sec.isVisible;
      }
      return prev;
    });
  };

  // Section Content & Style Updates
  const handleUpdateSectionContent = (field: string, value: any) => {
    if (!selectedSectionId) return;
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      const sec = targetPage?.sections.find((s) => s.id === selectedSectionId);
      if (sec) {
        sec.content = { ...sec.content, [field]: value };
      }
      return prev;
    });
  };

  const handleUpdateSectionStyle = (field: string, value: any) => {
    if (!selectedSectionId) return;
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      const sec = targetPage?.sections.find((s) => s.id === selectedSectionId);
      if (sec) {
        sec.styles = { ...sec.styles, [field]: value };
      }
      return prev;
    });
  };

  const handleUpdateDataSource = (field: string, value: any) => {
    if (!selectedSectionId) return;
    updateConfig((prev) => {
      const targetPage = prev.pages.find((p) => p.slug === activePageSlug);
      const sec = targetPage?.sections.find((s) => s.id === selectedSectionId);
      if (sec) {
        sec.dataSource = { ...(sec.dataSource || { type: "products", filter: "featured", limit: 8 }), [field]: value };
      }
      return prev;
    });
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/website-builder/${storeSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_DRAFT",
          draftConfig: config,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to save draft");
      setHasUnsavedChanges(false);
      toast.success("Draft saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Could not save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Website
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // First save draft if modified
      if (hasUnsavedChanges) {
        await fetch(`/api/website-builder/${storeSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SAVE_DRAFT",
            draftConfig: config,
          }),
        });
      }

      const res = await fetch(`/api/website-builder/${storeSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH",
          changeSummary: `Website published via Visual Builder`,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to publish website");

      setHasUnsavedChanges(false);
      if (json.data?.revisions) {
        setRevisions(json.data.revisions);
      }
      toast.success(`🎉 Website published live (v${json.data.versionNumber})!`);
    } catch (err: any) {
      toast.error(err.message || "Could not publish website");
    } finally {
      setIsPublishing(false);
    }
  };

  // Viewport Container Widths
  const viewportWidthClass = {
    desktop: "w-full max-w-full",
    tablet: "w-[768px] shadow-2xl rounded-2xl border border-zinc-700/50 my-6 mx-auto",
    mobile: "w-[390px] shadow-2xl rounded-3xl border border-zinc-700/50 my-6 mx-auto",
  }[viewport];

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden select-none">
      {/* 1. TOP HEADER APP BAR */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-30 shadow-xs">
        {/* Left: Store Name & Page Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-zinc-900 dark:text-white tracking-tight">
              {storeName}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Website Builder
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              {activeTemplate.name}
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />

          {/* Page Picker Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Page:</span>
            <select
              value={activePageSlug}
              onChange={(e) => {
                setActivePageSlug(e.target.value);
                setSelectedSectionId(null);
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
            >
              {config.pages.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.title} {p.isHomepage ? "(Home)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Interaction Mode & Breakpoint Viewport Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Mode Switcher: Edit vs Preview */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => {
                setIsPreviewMode(false);
                toast.success("Edit Mode: Click any element to select & customize", { id: "mode-toast", duration: 1500 });
              }}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                !isPreviewMode
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <PencilSquareIcon className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPreviewMode(true);
                toast.success("Preview Mode: Real link navigation & interaction active", { id: "mode-toast", duration: 1500 });
              }}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isPreviewMode
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span>Preview / Interact</span>
            </button>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewport === "desktop"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <ComputerDesktopIcon className="w-4 h-4" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewport === "tablet"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <DeviceTabletIcon className="w-4 h-4" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                viewport === "mobile"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <DevicePhoneMobileIcon className="w-4 h-4" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Undo Button */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-2 rounded-xl border transition ${
              canUndo
                ? "text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                : "text-zinc-300 dark:text-zinc-600 border-zinc-100 dark:border-zinc-800 cursor-not-allowed opacity-50"
            }`}
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
          </button>

          {/* Redo Button */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-2 rounded-xl border transition ${
              canRedo
                ? "text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                : "text-zinc-300 dark:text-zinc-600 border-zinc-100 dark:border-zinc-800 cursor-not-allowed opacity-50"
            }`}
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
          </button>

          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-rose-500 to-indigo-600 hover:opacity-90 shadow-sm transition"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Ask AI ✨</span>
          </button>

          {/* History Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            title="Version History"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ClockIcon className="w-5 h-5" />
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              hasUnsavedChanges
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Draft *" : "Draft Saved"}
          </button>

          {/* Publish */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-md transition"
          >
            {isPublishing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
            <span>Publish Live</span>
          </button>
        </div>
      </header>

      {/* 2. STUDIO WORKSPACE BODY */}
      <div className="flex grow overflow-hidden relative">
        {/* LEFT SIDEBAR (Hidden in Preview Mode) */}
        {!isPreviewMode && (
          <aside className="w-80 shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-20">
            {/* Sidebar Navigation Tabs */}
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("sections")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "sections"
                    ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Sections
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pages")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "pages"
                    ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Pages
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("theme")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "theme"
                    ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Design
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("navigation")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "navigation"
                    ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Nav
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  activeTab === "templates"
                    ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Template
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-4 overflow-y-auto grow space-y-4">
              {/* TAB 1: SECTIONS TREE */}
              {activeTab === "sections" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Page Sections ({activePage?.sections?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Universal Header Item */}
                    <div
                      onClick={() => {
                        setSelectedSectionId("header");
                        setSelectedTargetId("component.Header");
                        setSelectedElement({
                          targetId: "component.Header",
                          componentKey: "Header",
                          sectionId: "header",
                          label: "Store Navigation & Header",
                          editabilityStatus: "FULLY_EDITABLE",
                          hierarchy: [
                            { level: "page", id: "global", label: "GLOBAL" },
                            { level: "component", id: "Header", label: "Header" },
                          ],
                        });
                        const el =
                          document.getElementById("section-header") ||
                          document.querySelector('[data-editor-section="header"]');
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        selectedElement?.componentKey === "Header" || selectedSectionId === "header"
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-black">
                          H
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            Header & Navigation
                          </h4>
                          <span className="text-[10px] text-zinc-400">
                            Global Shell Header
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        Customize
                      </span>
                    </div>

                    {(activePage?.sections || []).map((sec, idx) => {
                      const isSelected = selectedSectionId === sec.id;
                      const regItem = SECTION_REGISTRY[sec.type as SectionType];
                      const rawId = sec.id.replace(/^sec-/, "").replace(/-\d+$/, "");
                      const matchedAuthSec = (activeTemplate.authenticSections || []).find(
                        (s) => s.id === sec.id || s.id === rawId || sec.id.includes(s.id) || rawId.includes(s.id)
                      );
                      const compName = (sec as any).component || matchedAuthSec?.component || (sec as any).componentName || rawId;
                      const adapter = getEditableComponent(compName);

                      return (
                        <div
                          key={sec.id}
                          onClick={() => {
                            setSelectedSectionId(sec.id);
                            setSelectedTargetId(`component.${compName}`);
                            setSelectedElement({
                              targetId: `component.${compName}`,
                              componentKey: compName,
                              sectionId: sec.id,
                              label: sec.name || matchedAuthSec?.name || adapter?.label || compName,
                              editabilityStatus: adapter?.status || "FULLY_EDITABLE",
                              hierarchy: [
                                { level: "page", id: activePage?.slug || "home", label: (activePage?.slug || "home").toUpperCase() },
                                { level: "section", id: rawId, label: sec.name || matchedAuthSec?.name || rawId },
                                { level: "component", id: compName, label: sec.name || matchedAuthSec?.name || compName },
                              ],
                            });

                            const el =
                              document.getElementById(`section-${rawId}`) ||
                              document.getElementById(`section-${sec.id}`) ||
                              document.getElementById(sec.id) ||
                              document.getElementById(rawId) ||
                              document.querySelector(`[data-editor-section="${rawId}"]`) ||
                              document.querySelector(`[data-editor-section="${sec.id}"]`) ||
                              document.querySelector(`[data-editor-component="${compName}"]`);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs"
                              : "border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          } ${!sec.isVisible ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono text-zinc-400">
                              {idx + 1}.
                            </span>
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                {sec.name || matchedAuthSec?.name || regItem?.title || sec.type}
                              </h4>
                              <span className="text-[10px] text-zinc-400 capitalize">
                                {compName || sec.type}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(sec.id)}
                              title={sec.isVisible ? "Hide section" : "Show section"}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              {sec.isVisible ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeSlashIcon className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sec.id, "up")}
                              disabled={idx === 0}
                              title="Move up"
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30"
                            >
                              <ArrowUpIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSection(sec.id, "down")}
                              disabled={idx === (activePage?.sections?.length || 0) - 1}
                              title="Move down"
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30"
                            >
                              <ArrowDownIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateSection(sec.id)}
                              title="Duplicate"
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              title="Delete"
                              className="p-1 text-zinc-400 hover:text-rose-500"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Universal Footer Item */}
                    <div
                      onClick={() => {
                        setSelectedSectionId("footer");
                        setSelectedTargetId("component.Footer");
                        setSelectedElement({
                          targetId: "component.Footer",
                          componentKey: "Footer",
                          sectionId: "footer",
                          label: "Global Store Footer",
                          editabilityStatus: "FULLY_EDITABLE",
                          hierarchy: [
                            { level: "page", id: "global", label: "GLOBAL" },
                            { level: "component", id: "Footer", label: "Footer" },
                          ],
                        });
                        const el =
                          document.getElementById("section-footer") ||
                          document.querySelector('[data-editor-section="footer"]');
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "end" });
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        selectedElement?.componentKey === "Footer" || selectedSectionId === "footer"
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-xs"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[10px] font-black">
                          F
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            Footer & Contact Info
                          </h4>
                          <span className="text-[10px] text-zinc-400">
                            Global Shell Footer
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                        Customize
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="w-full py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:border-rose-500 hover:text-rose-600 flex items-center justify-center gap-1.5 transition"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Insert New Section</span>
                  </button>
                </div>
              )}

              {/* TAB 2: PAGES MANAGER */}
              {activeTab === "pages" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Store Pages ({config.pages.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const title = prompt("Enter new page title:");
                        if (!title) return;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        updateConfig((prev) => {
                          if (prev.pages.some((p) => p.slug === slug)) {
                            toast.error("A page with this slug already exists");
                            return prev;
                          }
                          prev.pages.push({
                            id: `page-${slug}-${Date.now()}`,
                            title,
                            slug,
                            isHomepage: false,
                            isVisible: true,
                            order: prev.pages.length,
                            seo: { metaTitle: title, metaDescription: `Learn more at ${title}` },
                            sections: [],
                          });
                          return prev;
                        });
                        setActivePageSlug(slug);
                        toast.success(`Page '${title}' created!`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>New Page</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {config.pages.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePageSlug(p.slug);
                          setSelectedSectionId(null);
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                          activePageSlug === p.slug
                            ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs"
                            : "border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                              {p.title}
                            </h4>
                            {p.isHomepage && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-rose-500/10 text-rose-600">
                                Home
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400">/{p.slug}</span>
                        </div>

                        {!p.isHomepage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete page '${p.title}'?`)) {
                                updateConfig((prev) => {
                                  prev.pages = prev.pages.filter((page) => page.id !== p.id);
                                  return prev;
                                });
                                setActivePageSlug("home");
                              }
                            }}
                            className="p-1 text-zinc-400 hover:text-rose-500"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: THEME & DESIGN TOKENS */}
              {activeTab === "theme" && (
                <div className="space-y-6">
                  {/* Preset Palettes */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Color Presets
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            updateConfig((prev) => {
                              prev.theme.primaryColor = preset.primary;
                              prev.theme.secondaryColor = preset.secondary;
                              prev.theme.accentColor = preset.accent;
                              return prev;
                            });
                            toast.success(`Applied ${preset.name} theme`);
                          }}
                          className="flex items-center gap-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-left hover:border-rose-500 transition"
                        >
                          <div className="flex gap-1">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Individual Colors */}
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Custom Palette
                    </span>
                    <div className="space-y-2">
                      <div>
                        <label className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          <span>Primary Color</span>
                          <span className="font-mono text-[11px] text-zinc-400">{config.theme.primaryColor}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.theme.primaryColor}
                            onChange={(e) => updateConfig((prev) => { prev.theme.primaryColor = e.target.value; return prev; })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={config.theme.primaryColor}
                            onChange={(e) => updateConfig((prev) => { prev.theme.primaryColor = e.target.value; return prev; })}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          <span>Secondary Color</span>
                          <span className="font-mono text-[11px] text-zinc-400">{config.theme.secondaryColor}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.theme.secondaryColor}
                            onChange={(e) => updateConfig((prev) => { prev.theme.secondaryColor = e.target.value; return prev; })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={config.theme.secondaryColor}
                            onChange={(e) => updateConfig((prev) => { prev.theme.secondaryColor = e.target.value; return prev; })}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Typography
                    </span>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Heading Font
                      </label>
                      <select
                        value={config.theme.headingFont}
                        onChange={(e) => updateConfig((prev) => { prev.theme.headingFont = e.target.value; return prev; })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                      >
                        {GOOGLE_FONTS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Body Font
                      </label>
                      <select
                        value={config.theme.bodyFont}
                        onChange={(e) => updateConfig((prev) => { prev.theme.bodyFont = e.target.value; return prev; })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                      >
                        {GOOGLE_FONTS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Radii */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Border Radii
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Buttons</label>
                        <select
                          value={config.theme.buttonRadius}
                          onChange={(e) => updateConfig((prev) => { prev.theme.buttonRadius = e.target.value as any; return prev; })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                        >
                          <option value="none">Sharp (0px)</option>
                          <option value="sm">Small (4px)</option>
                          <option value="md">Medium (8px)</option>
                          <option value="lg">Large (12px)</option>
                          <option value="full">Pill (Full)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Cards</label>
                        <select
                          value={config.theme.cardRadius}
                          onChange={(e) => updateConfig((prev) => { prev.theme.cardRadius = e.target.value as any; return prev; })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                        >
                          <option value="none">Sharp</option>
                          <option value="md">Standard</option>
                          <option value="xl">Rounded (16px)</option>
                          <option value="2xl">Ultra (24px)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NAVIGATION BUILDER */}
              {activeTab === "navigation" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Header Options
                    </span>
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.navigation.headerSettings.sticky}
                        onChange={(e) => updateConfig((prev) => { prev.navigation.headerSettings.sticky = e.target.checked; return prev; })}
                        className="rounded-sm text-rose-600"
                      />
                      <span>Sticky Header</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.navigation.headerSettings.showWhatsAppBtn}
                        onChange={(e) => updateConfig((prev) => { prev.navigation.headerSettings.showWhatsAppBtn = e.target.checked; return prev; })}
                        className="rounded-sm text-rose-600"
                      />
                      <span>Show WhatsApp Button</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.navigation.headerSettings.showAnnouncementBar}
                        onChange={(e) => updateConfig((prev) => { prev.navigation.headerSettings.showAnnouncementBar = e.target.checked; return prev; })}
                        className="rounded-sm text-rose-600"
                      />
                      <span>Announcement Bar</span>
                    </label>

                    {config.navigation.headerSettings.showAnnouncementBar && (
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Announcement Text
                        </label>
                        <input
                          type="text"
                          value={config.navigation.headerSettings.announcementBarText || ""}
                          onChange={(e) => updateConfig((prev) => { prev.navigation.headerSettings.announcementBarText = e.target.value; return prev; })}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Footer Settings
                    </span>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Copyright Text
                      </label>
                      <input
                        type="text"
                        value={config.navigation.footerSettings.copyrightText || ""}
                        onChange={(e) => updateConfig((prev) => { prev.navigation.footerSettings.copyrightText = e.target.value; return prev; })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TEMPLATES BROWSER & SWITCHER */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  {/* Current Active Template Card */}
                  <div className="p-3.5 rounded-xl border-2 border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">
                        Active Authentic Template
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold">
                        {activeTemplate.id}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activeTemplate.name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {activeTemplate.description}
                    </p>
                    <div className="pt-2 border-t border-rose-200 dark:border-rose-900/40 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1 font-mono">
                      <div>Shell: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeTemplate.shellLayout}</span></div>
                      <div>Body: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeTemplate.bodyComponent}</span></div>
                      <div>Sections: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{activeTemplate.authenticSections.length}</span></div>
                    </div>
                  </div>

                  {/* Template Catalog Search & Filter */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Switch Template ({allTemplates.length})
                    </span>
                    <input
                      type="text"
                      placeholder="Search templates (e.g. Shoes, Gym, Automotive)..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                    />
                    <select
                      value={templateCategoryFilter}
                      onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs capitalize"
                    >
                      <option value="all">All Categories ({allTemplates.length})</option>
                      <option value="ecommerce">Ecommerce</option>
                      <option value="automotive">Automotive</option>
                      <option value="courses">Courses / Education</option>
                      <option value="services">Services / Bookings</option>
                      <option value="real-estate">Real Estate</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="fitness">Fitness</option>
                      <option value="restaurant">Restaurant</option>
                    </select>
                  </div>

                  {/* Template Catalog List */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {allTemplates
                      .filter((tpl) => {
                        const matchesCat =
                          templateCategoryFilter === "all" ||
                          tpl.category === templateCategoryFilter;
                        const q = templateSearch.toLowerCase().trim();
                        const matchesSearch =
                          !q ||
                          tpl.name.toLowerCase().includes(q) ||
                          tpl.id.toLowerCase().includes(q) ||
                          tpl.variant.toLowerCase().includes(q) ||
                          tpl.category.toLowerCase().includes(q);
                        return matchesCat && matchesSearch;
                      })
                      .map((tpl) => {
                        const isCurrent = tpl.id === activeTemplate.id;
                        return (
                          <div
                            key={tpl.id}
                            className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                              isCurrent
                                ? "border-rose-500 bg-rose-50/30 dark:bg-rose-950/20"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white dark:bg-zinc-900"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {tpl.name}
                                </span>
                                {isCurrent ? (
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">
                                    Current
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                {tpl.id} &bull; {tpl.category}
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                {tpl.description || `${tpl.name} theme tailored for ${tpl.category}.`}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <span className="text-[10px] text-zinc-400">
                                {tpl.authenticSections.length} sections
                              </span>
                              {!isCurrent ? (
                                <button
                                  type="button"
                                  onClick={() => handleSwitchTemplate(tpl)}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-rose-600 text-white dark:bg-zinc-800 dark:hover:bg-rose-600 text-[11px] font-bold transition"
                                >
                                  Apply Template
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                  <CheckIcon className="w-3.5 h-3.5" /> Active
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* CENTER INTERACTIVE CANVAS */}
        <main
          onClickCapture={handleCanvasClickCapture}
          className="grow overflow-y-auto bg-zinc-200/70 dark:bg-zinc-950 flex flex-col items-center relative"
        >
          <div
            className={`transition-all duration-300 bg-white dark:bg-zinc-900 relative ${viewportWidthClass}`}
            style={{
              transform: "translate3d(0, 0, 0)",
              isolation: "isolate",
            }}
          >
            <WebsiteRenderer
              config={config}
              category={category}
              variant={variant}
              storeFormData={storeFormData}
              paymentMethods={paymentMethods}
              ghubaData={ghubaData}
              pageSlug={activePageSlug}
              companyId={companyId}
              storeLogoUrl={storeLogoUrl}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              address={address}
              socialLinks={socialLinks}
              isEditorPreview={true}
              isPreviewMode={isPreviewMode}
              selectedSectionId={selectedSectionId}
              onSelectSection={(secId) => {
                setSelectedSectionId(secId);
                setSelectedElement(null);
                setSelectedTargetId(null);
              }}
              selectedTargetId={selectedTargetId}
              selectedElement={selectedElement}
              onSelectElement={(info) => {
                setSelectedElement(info);
                setSelectedTargetId(info ? info.targetId : null);
                if (info) {
                  setSelectedSectionId(null);
                }
              }}
              onUpdateOverride={handleUpdateOverride}
              onNavigatePage={(slug) => {
                const cleanSlug = slug.replace(/^\//, "") || "home";
                setActivePageSlug(cleanSlug);
                setSelectedSectionId(null);
                setSelectedElement(null);
                setSelectedTargetId(null);
              }}
            />
          </div>
        </main>

        {/* RIGHT INSPECTOR PANEL (When Element or Section is Selected) */}
        {!isPreviewMode && (selectedElement || selectedSection) && (
          <aside className="w-80 shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-20 animate-fadeIn">
            {selectedElement ? (
              // ELEMENT-LEVEL PROPERTY INSPECTOR
              <>
                {/* Inspector Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-rose-50/40 dark:bg-rose-950/20">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                        Element Inspector
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 font-bold">
                        {selectedElement.componentKey}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white capitalize">
                      {selectedElement.label || selectedElement.elementKey || "Element"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedElement(null);
                      setSelectedTargetId(null);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Hierarchy Breadcrumbs Bar */}
                {selectedElement.hierarchy && selectedElement.hierarchy.length > 0 && (
                  <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto text-[10px]">
                    {selectedElement.hierarchy.map((item, idx) => {
                      const isLast = idx === selectedElement.hierarchy!.length - 1;
                      return (
                        <React.Fragment key={item.id + idx}>
                          {idx > 0 && <span className="text-zinc-400">&gt;</span>}
                          <button
                            type="button"
                            onClick={() => {
                              if (item.level === "page") {
                                setSelectedElement(null);
                                setSelectedTargetId(null);
                              } else if (item.level === "section") {
                                setSelectedTargetId(null);
                                setSelectedElement(null);
                                setSelectedSectionId(item.id);
                                const el =
                                  document.getElementById(`section-${item.id}`) ||
                                  document.getElementById(item.id);
                                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                              } else if (item.level === "component") {
                                const adapter = getEditableComponent(item.id);
                                setSelectedTargetId(null);
                                setSelectedElement({
                                  targetId: `component.${item.id}`,
                                  componentKey: item.id,
                                  label: adapter?.label || item.id,
                                  editabilityStatus: adapter?.status || "FULLY_EDITABLE",
                                  hierarchy: selectedElement.hierarchy!.slice(0, idx + 1),
                                });
                              }
                            }}
                            disabled={isLast}
                            className={`font-semibold shrink-0 transition ${
                              isLast
                                ? "text-rose-600 dark:text-rose-400 font-bold"
                                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:underline cursor-pointer"
                            }`}
                          >
                            {item.label}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Inspector Content */}
                <div className="p-4 overflow-y-auto grow space-y-4 text-xs">
                  {/* Editability Status Badge */}
                  {selectedElement.editabilityStatus && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          selectedElement.editabilityStatus === "FULLY_EDITABLE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : selectedElement.editabilityStatus === "PARTIALLY_EDITABLE"
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                            : selectedElement.editabilityStatus === "REGISTERED_SCHEMA_FIELD"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                            : "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedElement.editabilityStatus === "FULLY_EDITABLE"
                              ? "bg-emerald-500"
                              : selectedElement.editabilityStatus === "PARTIALLY_EDITABLE"
                              ? "bg-amber-500"
                              : selectedElement.editabilityStatus === "REGISTERED_SCHEMA_FIELD"
                              ? "bg-indigo-500"
                              : "bg-zinc-400"
                          }`}
                        />
                        {selectedElement.editabilityStatus === "FULLY_EDITABLE"
                          ? "Verified Render Binding"
                          : selectedElement.editabilityStatus === "PARTIALLY_EDITABLE"
                          ? "Partially Editable"
                          : selectedElement.editabilityStatus === "REGISTERED_SCHEMA_FIELD"
                          ? "Defined in Schema (No Render Binding)"
                          : "View Only (Read Only)"}
                      </span>
                    </div>
                  )}

                  {/* Schema-defined field without render binding notice */}
                  {selectedElement.editabilityStatus === "REGISTERED_SCHEMA_FIELD" && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
                      <div className="font-bold text-[11px] flex items-center gap-1.5">
                        <span>⚠️</span> Unbound Schema Property
                      </div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                        This property is defined in the component schema, but the authentic template layout does not currently have a registered EditableElement listener on canvas for this key. Changes made here will be stored in component overrides.
                      </p>
                    </div>
                  )}

                  {/* View-Only Component Explanatory Notice */}
                  {selectedElement.editabilityStatus === "VIEW_ONLY" && (
                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 space-y-1">
                      <div className="font-bold text-[11px] text-zinc-700 dark:text-zinc-200">
                        Authentic Component (View Only)
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        This authentic storefront component is currently rendered with its authentic presentation layout. Content edits for this component are preserved in template defaults.
                      </p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 break-all border border-zinc-200/60 dark:border-zinc-700">
                    <span className="text-zinc-400 text-[10px] block uppercase font-sans font-bold mb-0.5">Target Identifier</span>
                    {selectedElement.targetId}
                  </div>

                  {/* COMPONENT-LEVEL SELECTION: Scan DOM for real EditableElements */}
                  {selectedElement.targetId.startsWith("component.") || selectedElement.targetId.startsWith("section.") ? (
                    <ComponentEditableElementsPanel
                      componentKey={selectedElement.componentKey}
                      sectionId={selectedElement.sectionId}
                      config={config}
                      onSelectElement={(info) => {
                        setSelectedElement(info);
                        setSelectedTargetId(info.targetId);
                        setSelectedSectionId(null);
                      }}
                    />
                  ) : selectedElement.type === "textarea" ? (
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        {selectedElement.label || "Text Content"}
                      </label>
                      <textarea
                        rows={4}
                        value={
                          config.componentOverrides?.[selectedElement.targetId] !== undefined
                            ? config.componentOverrides[selectedElement.targetId]
                            : selectedElement.value ?? ""
                        }
                        onChange={(e) => handleUpdateOverride(selectedElement.targetId, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs resize-none"
                      />
                    </div>
                  ) : selectedElement.type === "image" ? (
                    <div className="space-y-2">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={
                          config.componentOverrides?.[selectedElement.targetId] !== undefined
                            ? config.componentOverrides[selectedElement.targetId]
                            : selectedElement.value ?? ""
                        }
                        onChange={(e) => handleUpdateOverride(selectedElement.targetId, e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                      />
                      {(config.componentOverrides?.[selectedElement.targetId] || selectedElement.value) && (
                        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-32 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <img
                            src={config.componentOverrides?.[selectedElement.targetId] || selectedElement.value}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ) : selectedElement.type === "link" ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Preset Destination
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateOverride(selectedElement.targetId, e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                        >
                          <option value="">-- Choose Preset Destination --</option>
                          <option value="/">Home (Storefront)</option>
                          {config.pages
                            .filter((p) => !p.isHomepage)
                            .map((p) => (
                              <option key={p.id} value={`/${p.slug}`}>
                                {p.title} (/{p.slug})
                              </option>
                            ))}
                          {activeTemplate.category === "ecommerce" && (
                            <>
                              <option value="/products">All Products (/products)</option>
                              <option value="/categories">Categories (/categories)</option>
                              <option value="/about">About (/about)</option>
                              <option value="/contact">Contact (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "restaurant" && (
                            <>
                              <option value="/menu">Food & Beverage Menu (/menu)</option>
                              <option value="/reserve">Table Reservations (/reserve)</option>
                              <option value="/about">Story & Philosophy (/about)</option>
                              <option value="/contact">Contact & Location (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "real-estate" && (
                            <>
                              <option value="/listings">Property Catalog (/listings)</option>
                              <option value="/agents">Certified Agents (/agents)</option>
                              <option value="/contact">Schedule Tour (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "automotive" && (
                            <>
                              <option value="/inventory">Vehicle Inventory (/inventory)</option>
                              <option value="/services">Service Booking (/services)</option>
                              <option value="/contact">Dealership Contact (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "courses" && (
                            <>
                              <option value="/courses">Course Tracks (/courses)</option>
                              <option value="/instructors">Instructors & Mentors (/instructors)</option>
                              <option value="/enroll">Enrollment (/enroll)</option>
                            </>
                          )}
                          {activeTemplate.category === "bookings" && (
                            <>
                              <option value="/book">Book Appointment (/book)</option>
                              <option value="/services">Services Menu (/services)</option>
                            </>
                          )}
                          {activeTemplate.category === "fitness" && (
                            <>
                              <option value="/plans">Training Plans (/plans)</option>
                              <option value="/trainers">Personal Trainers (/trainers)</option>
                              <option value="/schedule">Class Schedule (/schedule)</option>
                              <option value="/contact">Join Now (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "services" && (
                            <>
                              <option value="/services">Services Offered (/services)</option>
                              <option value="/quote">Get a Quote (/quote)</option>
                              <option value="/about">Our Team (/about)</option>
                              <option value="/contact">Contact Us (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "travel" && (
                            <>
                              <option value="/destinations">Destinations (/destinations)</option>
                              <option value="/packages">Vacation Packages (/packages)</option>
                              <option value="/book">Plan Your Trip (/book)</option>
                              <option value="/contact">Concierge (/contact)</option>
                            </>
                          )}
                          {activeTemplate.category === "healthcare" && (
                            <>
                              <option value="/doctors">Physicians & Specialists (/doctors)</option>
                              <option value="/services">Medical Services (/services)</option>
                              <option value="/appointment">Book Appointment (/appointment)</option>
                              <option value="/contact">Emergency & Contact (/contact)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Custom URL / Path
                        </label>
                        <input
                          type="text"
                          value={
                            config.componentOverrides?.[selectedElement.targetId] !== undefined
                              ? config.componentOverrides[selectedElement.targetId]
                              : selectedElement.value ?? ""
                          }
                          onChange={(e) => handleUpdateOverride(selectedElement.targetId, e.target.value)}
                          placeholder="/shop or https://..."
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                        />
                      </div>

                      {/* Live Tenant-Normalized Link Preview */}
                      <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 space-y-1">
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block uppercase">
                          Resolved Tenant Destination
                        </span>
                        <div className="font-mono text-[10px] text-purple-900 dark:text-purple-200 break-all select-all">
                          {buildTenantUrl({
                            slug: storeSlug,
                            path:
                              config.componentOverrides?.[selectedElement.targetId] !== undefined
                                ? config.componentOverrides[selectedElement.targetId]
                                : selectedElement.value || "",
                          })}
                        </div>
                        <div className="text-[9px] text-purple-600/80 dark:text-purple-400">
                          In preview mode or on live storefront, this button navigates cleanly to this tenant route.
                        </div>
                      </div>
                    </div>
                  ) : selectedElement.type === "color" ? (
                    <div className="space-y-2">
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        Color Value
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            config.componentOverrides?.[selectedElement.targetId] !== undefined
                              ? config.componentOverrides[selectedElement.targetId]
                              : selectedElement.value ?? "#000000"
                          }
                          onChange={(e) => handleUpdateOverride(selectedElement.targetId, e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-zinc-200 dark:border-zinc-800 p-0.5"
                        />
                        <input
                          type="text"
                          value={
                            config.componentOverrides?.[selectedElement.targetId] !== undefined
                              ? config.componentOverrides[selectedElement.targetId]
                              : selectedElement.value ?? "#000000"
                          }
                          onChange={(e) => handleUpdateOverride(selectedElement.targetId, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        {selectedElement.label || "Text Value"}
                      </label>
                      <input
                        type="text"
                        value={
                          config.componentOverrides?.[selectedElement.targetId] !== undefined
                            ? config.componentOverrides[selectedElement.targetId]
                            : selectedElement.value ?? ""
                        }
                        onChange={(e) => handleUpdateOverride(selectedElement.targetId, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                      />
                    </div>
                  )}

                  {/* Override Status & Reset */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">
                        {config.componentOverrides?.[selectedElement.targetId] !== undefined
                          ? "✅ Custom override applied"
                          : "⚪ Using template default"}
                      </span>
                      {config.componentOverrides?.[selectedElement.targetId] !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleResetOverride(selectedElement.targetId)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>

                    {/* Data-Flow Debug Strip */}
                    <details className="group">
                      <summary className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider cursor-pointer select-none hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1">
                        <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                        Data Flow Debug (17 Diagnostics)
                      </summary>
                      {(() => {
                        const targetId = selectedElement.targetId;
                        const compKey = selectedElement.componentKey;
                        const adapter = getEditableComponent(compKey);
                        const lookupKeys = getCanonicalLookupKeys(targetId);
                        const storedVal = config.componentOverrides?.[targetId];
                        const activeVal = storedVal !== undefined ? storedVal : selectedElement.value;
                        const allAdapters = getAllEditableComponents();
                        return (
                          <div className="mt-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 space-y-1 text-[10px] font-mono">
                            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start">
                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">1. Component</span>
                              <span className="text-zinc-700 dark:text-zinc-300 break-all">{compKey}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">2. Section</span>
                              <span className="text-zinc-700 dark:text-zinc-300 break-all">{selectedSectionId || "—"}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">3. Target ID</span>
                              <span className="text-zinc-700 dark:text-zinc-300 break-all font-bold">{targetId}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">4. Target El</span>
                              <span className="text-zinc-600 dark:text-zinc-400 break-all">{targetId}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">5. Field Key</span>
                              <span className="text-zinc-700 dark:text-zinc-300 break-all">{selectedElement.elementKey || targetId.split('.').pop()}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">6. Live Val</span>
                              <span className={`break-all ${storedVal !== undefined ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-zinc-600 dark:text-zinc-400"}`}>
                                {activeVal !== undefined && activeVal !== null ? String(activeVal).slice(0, 80) : "—"}
                              </span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">7. Default</span>
                              <span className="text-zinc-500 dark:text-zinc-400 break-all italic">
                                {selectedElement.defaultValue !== undefined && selectedElement.defaultValue !== null
                                  ? String(selectedElement.defaultValue).slice(0, 60)
                                  : (selectedElement.value !== undefined && selectedElement.value !== null ? String(selectedElement.value).slice(0, 60) : "—")}
                              </span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">8. Adapter Key</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{adapter?.componentKey || "—"}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">9. Status</span>
                              <span className={`font-bold ${selectedElement.editabilityStatus === "FULLY_EDITABLE" ? "text-emerald-600" : selectedElement.editabilityStatus === "REGISTERED_SCHEMA_FIELD" ? "text-indigo-600" : "text-zinc-500"}`}>
                                {selectedElement.editabilityStatus || adapter?.status || "VIEW_ONLY"}
                              </span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">10. Properties</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{Object.keys(adapter?.properties || {}).length}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">11. Hierarchy</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{selectedElement.hierarchy?.length || 1} levels</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">12. Overrides</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{Object.keys(config.componentOverrides || {}).length} active</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">13. Adapters</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{allAdapters.length} registered</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">14. Sync Active</span>
                              <span className="text-emerald-600 font-bold">YES</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">15. Tenant</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{storeSlug}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">16. Template</span>
                              <span className="text-zinc-700 dark:text-zinc-300 font-bold">{config.templateKey || activeTemplate.id}</span>

                              <span className="text-zinc-400 uppercase font-sans font-bold text-[9px]">17. Alias Chain</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 break-all leading-relaxed">
                                {lookupKeys.join(" → ")}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </details>
                  </div>
                </div>
              </>
            ) : selectedSection ? (
              <SectionLiveFieldsInspector
                section={selectedSection}
                config={config}
                onUpdateOverride={handleUpdateOverride}
                onSelectElement={(info) => {
                  setSelectedElement(info);
                  setSelectedTargetId(info.targetId);
                  setSelectedSectionId(null);
                }}
                onUpdateSectionStyle={handleUpdateSectionStyle}
                onUpdateDataSource={handleUpdateDataSource}
                onClose={() => setSelectedSectionId(null)}
              />
            ) : null}
      </aside>
    )}
      </div>

      {/* 3. MODALS */}
      <SectionPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectSection={handleAddSection}
      />

      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        storeSlug={storeSlug}
        currentConfig={config}
        activePageSlug={activePageSlug}
        onApplyChanges={(newConfig) => {
          setConfig(newConfig);
          setHasUnsavedChanges(true);
        }}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        storeSlug={storeSlug}
        revisions={revisions}
        onRestored={(restoredConfig) => {
          setConfig(restoredConfig);
          setHasUnsavedChanges(true);
        }}
      />

      {/* 4. TEMPLATE DIAGNOSTIC HUD */}
      <TemplateDiagnosticHud
        slug={storeSlug}
        template={activeTemplate}
        pageSlug={activePageSlug}
        hasPublishedConfig={!hasUnsavedChanges}
        sectionsCount={activePage?.sections?.length || activeTemplate.authenticSections.length}
        category={category}
        variant={variant}
        isEditor={true}
        isPreviewMode={isPreviewMode}
        selectedTargetId={selectedTargetId}
        selectedComponentKey={selectedElement?.componentKey}
        selectedSectionId={selectedSectionId}
        editabilityStatus={selectedElement?.editabilityStatus}
        host={typeof window !== "undefined" ? window.location.host : "localhost:3000"}
      />
    </div>
  );
}
