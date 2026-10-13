"use client";

import { useEditableContent } from "@/contexts/EditableContentContext";

/**
 * Universal state bridge for Website Builder store selectors.
 * Connects directly to EditableContentContext to prevent module resolution errors.
 */
export function useWebsiteBuilderStore<T = any>(selector?: (state: any) => T): T {
  const content = useEditableContent();
  const state = {
    isEditorMode: content.isEditorMode,
    isPreviewMode: content.isPreviewMode,
    isInteractionMode: content.isInteractionMode,
    selectedTargetId: content.selectedTargetId,
    selectedComponentKey: content.selectedComponentKey,
    selectedSectionId: content.selectedSectionId,
    selectedElement: content.selectedElement,
    componentOverrides: content.componentOverrides,
  };

  return selector ? selector(state) : (state as unknown as T);
}
