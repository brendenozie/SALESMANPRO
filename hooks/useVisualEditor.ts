"use client";

import { useEditableContent } from "@/contexts/EditableContentContext";

/**
 * Universal hook providing visual editor status and utilities.
 * Proxies to EditableContentContext.
 */
export function useVisualEditor() {
  const content = useEditableContent();
  return {
    isEditorMode: content.isEditorMode,
    isPreviewMode: content.isPreviewMode,
    isInteractionMode: content.isInteractionMode,
    selectedTargetId: content.selectedTargetId,
    selectedElement: content.selectedElement,
    buildUrl: content.buildUrl,
  };
}

export default useVisualEditor;
