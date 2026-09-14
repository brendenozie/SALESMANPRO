"use client";

import React, { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import {
  EditablePropertyType,
  parseTargetId,
  ComponentEditabilityStatus,
} from "@/lib/website-builder/editable-adapters";
import { getCanonicalLookupKeys, parseCanonicalTargetId } from "@/lib/website-builder/canonical-target-id";
import { buildTenantUrl } from "@/lib/tenant/tenant-router";

export interface HierarchyItem {
  level: "page" | "section" | "component" | "item" | "element";
  id: string;
  label: string;
}

export interface SelectedElementInfo {
  targetId: string;
  componentKey: string;
  sectionId?: string;
  elementKey?: string;
  label?: string;
  type?: EditablePropertyType;
  value?: any;
  defaultValue?: any;
  editabilityStatus?: ComponentEditabilityStatus | "REGISTERED_SCHEMA_FIELD";
  hierarchy?: HierarchyItem[];
}

export interface EditableContentContextType {
  componentOverrides: Record<string, any>;
  selectedTargetId: string | null;
  selectedComponentKey: string | null;
  selectedSectionId: string | null;
  selectedElement: SelectedElementInfo | null;
  isEditorMode: boolean;
  isPreviewMode: boolean;
  isInteractionMode: boolean;
  tenantSlug: string;
  getOverride: <T>(targetId: string, defaultValue: T) => T;
  setOverride: (targetId: string, value: any) => void;
  selectElement: (info: SelectedElementInfo | null) => void;
  selectTarget: (targetId: string, metadata?: Partial<SelectedElementInfo>) => void;
  selectComponent: (componentKey: string, sectionId?: string) => void;
  selectSection: (sectionId: string) => void;
  clearSelection: () => void;
  selectParent: () => void;
  enterInteractionMode: () => void;
  exitInteractionMode: () => void;
  buildUrl: (path: string, query?: Record<string, any>) => string;
}

const EditableContentContext = createContext<EditableContentContextType | null>(null);

export function useEditableContent(): EditableContentContextType {
  const context = useContext(EditableContentContext);
  if (!context) {
    // Return safe fallback for public storefront when outside explicit provider
    return {
      componentOverrides: {},
      selectedTargetId: null,
      selectedComponentKey: null,
      selectedSectionId: null,
      selectedElement: null,
      isEditorMode: false,
      isPreviewMode: false,
      isInteractionMode: false,
      tenantSlug: "",
      getOverride: (_id, defaultValue) => defaultValue,
      setOverride: () => {},
      selectElement: () => {},
      selectTarget: () => {},
      selectComponent: () => {},
      selectSection: () => {},
      clearSelection: () => {},
      selectParent: () => {},
      enterInteractionMode: () => {},
      exitInteractionMode: () => {},
      buildUrl: (path, query) => {
        if (!path) return "/";
        const qStr = query ? `?${new URLSearchParams(query as any).toString()}` : "";
        return `${path}${qStr}`;
      },
    };
  }
  return context;
}

export interface EditableContentProviderProps {
  children: ReactNode;
  componentOverrides?: Record<string, any>;
  tenantSlug?: string;
  isEditorMode?: boolean;
  isPreviewMode?: boolean;
  selectedTargetId?: string | null;
  selectedComponentKey?: string | null;
  selectedSectionId?: string | null;
  selectedElement?: SelectedElementInfo | null;
  onSelectElement?: (info: SelectedElementInfo | null) => void;
  onSelectComponent?: (componentKey: string) => void;
  onSelectSection?: (sectionId: string) => void;
  onUpdateOverride?: (targetId: string, value: any) => void;
  onNavigatePage?: (slug: string) => void;
  onTogglePreviewMode?: (preview: boolean) => void;
}

export function EditableContentProvider({
  children,
  componentOverrides = {},
  tenantSlug = "store",
  isEditorMode = false,
  isPreviewMode = false,
  selectedTargetId = null,
  selectedComponentKey = null,
  selectedSectionId = null,
  selectedElement = null,
  onSelectElement,
  onSelectComponent,
  onSelectSection,
  onUpdateOverride,
  onNavigatePage,
  onTogglePreviewMode,
}: EditableContentProviderProps) {
  const isInteractionMode = isPreviewMode;

  const getOverride = useCallback(
    <T,>(targetId: string, defaultValue: T): T => {
      if (!componentOverrides) return defaultValue;

      // 1. Direct exact lookup
      if (componentOverrides[targetId] !== undefined) {
        const val = componentOverrides[targetId];
        return (val && typeof val === "object" && "value" in val ? val.value : val) as T;
      }

      // 2. Candidate keys lookup (canonical & legacy aliases)
      const candidateKeys = getCanonicalLookupKeys(targetId);
      for (const key of candidateKeys) {
        if (componentOverrides[key] !== undefined) {
          const val = componentOverrides[key];
          return (val && typeof val === "object" && "value" in val ? val.value : val) as T;
        }
      }

      return defaultValue;
    },
    [componentOverrides]
  );

  const setOverride = useCallback(
    (targetId: string, value: any) => {
      onUpdateOverride?.(targetId, value);
    },
    [onUpdateOverride]
  );

  const selectElement = useCallback(
    (info: SelectedElementInfo | null) => {
      onSelectElement?.(info);
    },
    [onSelectElement]
  );

  const selectTarget = useCallback(
    (targetId: string, metadata?: Partial<SelectedElementInfo>) => {
      const parsed = parseTargetId(targetId);
      const hierarchy: HierarchyItem[] = [
        { level: "page", id: parsed.pageSlug || "home", label: (parsed.pageSlug || "home").toUpperCase() },
        { level: "component", id: metadata?.componentKey || parsed.componentKey || "Component", label: metadata?.componentKey || parsed.componentKey || "Component" },
      ];
      if (parsed.itemIndex !== undefined) {
        hierarchy.push({ level: "item", id: `${parsed.componentKey}.${parsed.itemIndex}`, label: `Item #${parsed.itemIndex + 1}` });
      }
      hierarchy.push({ level: "element", id: targetId, label: metadata?.label || parsed.fieldKey });

      const info: SelectedElementInfo = {
        targetId,
        componentKey: metadata?.componentKey || parsed.componentKey || "Component",
        sectionId: metadata?.sectionId || parsed.componentKey,
        elementKey: parsed.fieldKey,
        label: metadata?.label || parsed.fieldKey,
        type: metadata?.type || "text",
        value: metadata?.value !== undefined ? metadata.value : getOverride(targetId, ""),
        editabilityStatus: metadata?.editabilityStatus || "FULLY_EDITABLE",
        hierarchy,
      };
      onSelectElement?.(info);
    },
    [onSelectElement, getOverride]
  );

  const selectComponent = useCallback(
    (componentKey: string, sectionId?: string) => {
      onSelectComponent?.(componentKey);
      const hierarchy: HierarchyItem[] = [
        { level: "page", id: "home", label: "HOME" },
        { level: "component", id: componentKey, label: componentKey },
      ];
      onSelectElement?.({
        targetId: `component.${componentKey}`,
        componentKey,
        sectionId: sectionId || componentKey,
        label: componentKey,
        editabilityStatus: "FULLY_EDITABLE",
        hierarchy,
      });
    },
    [onSelectComponent, onSelectElement]
  );

  const selectSection = useCallback(
    (sectionId: string) => {
      onSelectSection?.(sectionId);
      const hierarchy: HierarchyItem[] = [
        { level: "page", id: "home", label: "HOME" },
        { level: "section", id: sectionId, label: sectionId },
      ];
      onSelectElement?.({
        targetId: `section.${sectionId}`,
        componentKey: sectionId,
        sectionId,
        label: sectionId,
        editabilityStatus: "FULLY_EDITABLE",
        hierarchy,
      });
    },
    [onSelectSection, onSelectElement]
  );

  const clearSelection = useCallback(() => {
    onSelectElement?.(null);
  }, [onSelectElement]);

  const selectParent = useCallback(() => {
    if (!selectedElement || !selectedElement.hierarchy || selectedElement.hierarchy.length <= 1) {
      clearSelection();
      return;
    }
    const currentHierarchy = selectedElement.hierarchy;
    const parentIndex = currentHierarchy.length - 2;
    if (parentIndex >= 0) {
      const parentCrumb = currentHierarchy[parentIndex];
      if (parentCrumb.level === "component") {
        selectComponent(parentCrumb.id);
      } else if (parentCrumb.level === "section") {
        selectSection(parentCrumb.id);
      } else if (parentCrumb.level === "page") {
        clearSelection();
      }
    }
  }, [selectedElement, clearSelection, selectComponent, selectSection]);

  const enterInteractionMode = useCallback(() => {
    onTogglePreviewMode?.(true);
  }, [onTogglePreviewMode]);

  const exitInteractionMode = useCallback(() => {
    onTogglePreviewMode?.(false);
  }, [onTogglePreviewMode]);

  const buildUrl = useCallback(
    (path: string, query?: Record<string, any>) => {
      return buildTenantUrl({
        slug: tenantSlug,
        path,
        query,
        context: {
          isEditor: isEditorMode && !isPreviewMode,
        },
      });
    },
    [tenantSlug, isEditorMode, isPreviewMode]
  );

  const value = useMemo<EditableContentContextType>(
    () => ({
      componentOverrides,
      selectedTargetId,
      selectedComponentKey,
      selectedSectionId,
      selectedElement,
      isEditorMode,
      isPreviewMode,
      isInteractionMode,
      tenantSlug,
      getOverride,
      setOverride,
      selectElement,
      selectTarget,
      selectComponent,
      selectSection,
      clearSelection,
      selectParent,
      enterInteractionMode,
      exitInteractionMode,
      buildUrl,
    }),
    [
      componentOverrides,
      selectedTargetId,
      selectedComponentKey,
      selectedSectionId,
      selectedElement,
      isEditorMode,
      isPreviewMode,
      isInteractionMode,
      tenantSlug,
      getOverride,
      setOverride,
      selectElement,
      selectTarget,
      selectComponent,
      selectSection,
      clearSelection,
      selectParent,
      enterInteractionMode,
      exitInteractionMode,
      buildUrl,
    ]
  );

  return (
    <EditableContentContext.Provider value={value}>
      {children}
    </EditableContentContext.Provider>
  );
}

/**
 * Interactive Element Wrapper that layers click-to-edit boundaries onto authentic components
 * without modifying their underlying styling or layout behavior.
 */
export interface EditableElementProps {
  targetId: string;
  componentKey: string;
  elementKey?: string;
  label?: string;
  type?: EditablePropertyType;
  defaultValue?: any;
  className?: string;
  inline?: boolean;
  children: ReactNode | ((resolvedValue: any) => ReactNode);
}

export function EditableElement({
  targetId,
  componentKey,
  elementKey,
  label,
  type = "text",
  defaultValue,
  className = "",
  inline = false,
  children,
}: EditableElementProps) {
  const { getOverride, selectedTargetId, isEditorMode, isPreviewMode, selectElement } = useEditableContent();
  const resolvedValue = getOverride(targetId, defaultValue);
  const parsed = useMemo(() => parseCanonicalTargetId(targetId), [targetId]);

  const renderedContent = typeof children === "function" ? children(resolvedValue) : children;

  // In public mode or pure preview mode, render child directly without any overlay wrappers
  if (!isEditorMode || isPreviewMode) {
    return <>{renderedContent}</>;
  }

  const isSelected = selectedTargetId === targetId;
  const Tag = inline ? "span" : "div";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const hierarchy: HierarchyItem[] = [
      { level: "page", id: parsed.pageSlug || "home", label: (parsed.pageSlug || "home").toUpperCase() },
      { level: "component", id: componentKey, label: componentKey },
    ];
    if (parsed.itemIndex !== undefined) {
      hierarchy.push({ level: "item", id: `${componentKey}.${parsed.itemIndex}`, label: `Item #${parsed.itemIndex + 1}` });
    }
    hierarchy.push({ level: "element", id: targetId, label: label || elementKey || parsed.fieldKey });

    selectElement({
      targetId,
      componentKey,
      elementKey: elementKey || parsed.fieldKey,
      label: label || elementKey || "Element",
      type,
      value: resolvedValue,
      editabilityStatus: "FULLY_EDITABLE",
      hierarchy,
    });
  };

  return (
    <Tag
      onClick={handleClick}
      data-editable-id={targetId}
      data-editor-target={targetId}
      data-editor-component={componentKey}
      data-editor-element={elementKey || parsed.fieldKey}
      data-editor-label={label || elementKey || "Element"}
      data-editor-type={type}
      data-editor-value={typeof resolvedValue === "string" || typeof resolvedValue === "number" ? String(resolvedValue) : ""}
      data-editor-default={typeof defaultValue === "string" || typeof defaultValue === "number" ? String(defaultValue) : ""}
      data-editor-binding="VERIFIED_RENDER_BINDING"
      className={`relative group transition-all duration-150 cursor-pointer ${
        inline ? "inline-block" : "block"
      } ${
        isSelected
          ? "ring-2 ring-rose-500 ring-offset-1 rounded-md z-30 shadow-xs"
          : "hover:outline-dashed hover:outline-2 hover:outline-rose-400/80 hover:ring-2 hover:ring-rose-400/20 rounded-md"
      } ${className}`}
    >
      {/* Visual Inspector selection label */}
      {isSelected && (
        <span className="absolute -top-5 left-0 z-40 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono font-bold shadow pointer-events-none whitespace-nowrap">
          {label || elementKey || "Selected"}
        </span>
      )}
      {renderedContent}
    </Tag>
  );
}
