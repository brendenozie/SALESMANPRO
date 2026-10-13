"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWebsiteBuilderStore = void 0;
const EditableContentContext_1 = require("@/contexts/EditableContentContext");
/**
 * Universal state bridge for Website Builder store selectors.
 * Connects directly to EditableContentContext to prevent module resolution errors.
 */
function useWebsiteBuilderStore(selector) {
    const content = (0, EditableContentContext_1.useEditableContent)();
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
    return selector ? selector(state) : state;
}
exports.useWebsiteBuilderStore = useWebsiteBuilderStore;
