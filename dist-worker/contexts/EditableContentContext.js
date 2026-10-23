"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditableElement = exports.EditableContentProvider = exports.useEditor = exports.useEditableContent = void 0;
const react_1 = __importStar(require("react"));
const editable_adapters_1 = require("@/lib/website-builder/editable-adapters");
const canonical_target_id_1 = require("@/lib/website-builder/canonical-target-id");
const tenant_router_1 = require("@/lib/tenant/tenant-router");
const EditableContentContext = (0, react_1.createContext)(null);
function useEditableContent() {
    const context = (0, react_1.useContext)(EditableContentContext);
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
            setOverride: () => { },
            selectElement: () => { },
            selectTarget: () => { },
            selectComponent: () => { },
            selectSection: () => { },
            clearSelection: () => { },
            selectParent: () => { },
            enterInteractionMode: () => { },
            exitInteractionMode: () => { },
            buildUrl: (path, query) => {
                if (!path)
                    return "/";
                const qStr = query ? `?${new URLSearchParams(query).toString()}` : "";
                return `${path}${qStr}`;
            },
        };
    }
    return context;
}
exports.useEditableContent = useEditableContent;
exports.useEditor = useEditableContent;
function EditableContentProvider({ children, componentOverrides = {}, tenantSlug = "store", isEditorMode = false, isPreviewMode = false, selectedTargetId = null, selectedComponentKey = null, selectedSectionId = null, selectedElement = null, onSelectElement, onSelectComponent, onSelectSection, onUpdateOverride, onNavigatePage, onTogglePreviewMode, }) {
    const isInteractionMode = isPreviewMode;
    const getOverride = (0, react_1.useCallback)((targetId, defaultValue) => {
        if (!componentOverrides)
            return defaultValue;
        // 1. Direct exact lookup
        if (componentOverrides[targetId] !== undefined) {
            const val = componentOverrides[targetId];
            return (val && typeof val === "object" && "value" in val ? val.value : val);
        }
        // 2. Candidate keys lookup (canonical & legacy aliases)
        const candidateKeys = (0, canonical_target_id_1.getCanonicalLookupKeys)(targetId);
        for (const key of candidateKeys) {
            if (componentOverrides[key] !== undefined) {
                const val = componentOverrides[key];
                return (val && typeof val === "object" && "value" in val ? val.value : val);
            }
        }
        return defaultValue;
    }, [componentOverrides]);
    const setOverride = (0, react_1.useCallback)((targetId, value) => {
        onUpdateOverride?.(targetId, value);
    }, [onUpdateOverride]);
    const selectElement = (0, react_1.useCallback)((info) => {
        onSelectElement?.(info);
    }, [onSelectElement]);
    const selectTarget = (0, react_1.useCallback)((targetId, metadata) => {
        const parsed = (0, editable_adapters_1.parseTargetId)(targetId);
        const hierarchy = [
            { level: "page", id: parsed.pageSlug || "home", label: (parsed.pageSlug || "home").toUpperCase() },
            { level: "component", id: metadata?.componentKey || parsed.componentKey || "Component", label: metadata?.componentKey || parsed.componentKey || "Component" },
        ];
        if (parsed.itemIndex !== undefined) {
            hierarchy.push({ level: "item", id: `${parsed.componentKey}.${parsed.itemIndex}`, label: `Item #${parsed.itemIndex + 1}` });
        }
        hierarchy.push({ level: "element", id: targetId, label: metadata?.label || parsed.fieldKey });
        const info = {
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
    }, [onSelectElement, getOverride]);
    const selectComponent = (0, react_1.useCallback)((componentKey, sectionId) => {
        onSelectComponent?.(componentKey);
        const hierarchy = [
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
    }, [onSelectComponent, onSelectElement]);
    const selectSection = (0, react_1.useCallback)((sectionId) => {
        onSelectSection?.(sectionId);
        const hierarchy = [
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
    }, [onSelectSection, onSelectElement]);
    const clearSelection = (0, react_1.useCallback)(() => {
        onSelectElement?.(null);
    }, [onSelectElement]);
    const selectParent = (0, react_1.useCallback)(() => {
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
            }
            else if (parentCrumb.level === "section") {
                selectSection(parentCrumb.id);
            }
            else if (parentCrumb.level === "page") {
                clearSelection();
            }
        }
    }, [selectedElement, clearSelection, selectComponent, selectSection]);
    const enterInteractionMode = (0, react_1.useCallback)(() => {
        onTogglePreviewMode?.(true);
    }, [onTogglePreviewMode]);
    const exitInteractionMode = (0, react_1.useCallback)(() => {
        onTogglePreviewMode?.(false);
    }, [onTogglePreviewMode]);
    const buildUrl = (0, react_1.useCallback)((path, query) => {
        return (0, tenant_router_1.buildTenantUrl)({
            slug: tenantSlug,
            path,
            query,
            context: {
                isEditor: isEditorMode && !isPreviewMode,
            },
        });
    }, [tenantSlug, isEditorMode, isPreviewMode]);
    const value = (0, react_1.useMemo)(() => ({
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
    }), [
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
    ]);
    return (react_1.default.createElement(EditableContentContext.Provider, { value: value }, children));
}
exports.EditableContentProvider = EditableContentProvider;
function extractTextFromChildren(child) {
    if (child === null || child === undefined)
        return undefined;
    if (typeof child === "string" || typeof child === "number")
        return String(child);
    if (react_1.default.isValidElement(child)) {
        const props = child.props;
        if (props && props.src)
            return String(props.src);
        if (props && props.href && !props.children)
            return String(props.href);
        if (props && props.children)
            return extractTextFromChildren(props.children);
    }
    if (Array.isArray(child)) {
        const texts = child.map(extractTextFromChildren).filter(Boolean);
        return texts.length > 0 ? texts.join(" ") : undefined;
    }
    return undefined;
}
function renderStaticChildWithOverride(child, resolvedValue, type = "text") {
    if (resolvedValue === undefined || resolvedValue === null)
        return child;
    if (typeof child === "string" || typeof child === "number") {
        return String(resolvedValue);
    }
    if (!react_1.default.isValidElement(child)) {
        return child;
    }
    // If it's an image component or type is image
    if (type === "image" || (child.props && "src" in child.props)) {
        return react_1.default.cloneElement(child, {
            ...child.props,
            src: String(resolvedValue),
        });
    }
    // If it's a link with no children or type is link
    if (type === "link" || (child.props && "href" in child.props && !child.props.children)) {
        return react_1.default.cloneElement(child, {
            ...child.props,
            href: String(resolvedValue),
        });
    }
    // Normal elements: span, p, h1, h2, h3, button, motion.h2, etc.
    const innerChildren = child.props?.children;
    if (typeof innerChildren === "string" || typeof innerChildren === "number") {
        return react_1.default.cloneElement(child, {
            ...child.props,
            children: String(resolvedValue),
        });
    }
    if (Array.isArray(innerChildren)) {
        // Locate the text-bearing item in the array to preserve non-text decorators/icons (e.g. [<Icon />, <span>Text</span>])
        let textIdx = -1;
        for (let i = 0; i < innerChildren.length; i++) {
            const it = innerChildren[i];
            if (typeof it === "string" || typeof it === "number") {
                textIdx = i;
                break;
            }
            if (react_1.default.isValidElement(it)) {
                const grandChildren = it.props?.children;
                if (typeof grandChildren === "string" || typeof grandChildren === "number") {
                    textIdx = i;
                    break;
                }
            }
        }
        if (textIdx !== -1) {
            const updatedChildren = [...innerChildren];
            const targetItem = updatedChildren[textIdx];
            if (typeof targetItem === "string" || typeof targetItem === "number") {
                updatedChildren[textIdx] = String(resolvedValue);
            }
            else if (react_1.default.isValidElement(targetItem)) {
                updatedChildren[textIdx] = react_1.default.cloneElement(targetItem, {
                    ...targetItem.props,
                    children: String(resolvedValue),
                });
            }
            return react_1.default.cloneElement(child, {
                ...child.props,
                children: updatedChildren,
            });
        }
        return react_1.default.cloneElement(child, {
            ...child.props,
            children: String(resolvedValue),
        });
    }
    if (react_1.default.isValidElement(innerChildren)) {
        return react_1.default.cloneElement(child, {
            ...child.props,
            children: renderStaticChildWithOverride(innerChildren, resolvedValue, type),
        });
    }
    return react_1.default.cloneElement(child, {
        ...child.props,
        children: String(resolvedValue),
    });
}
function EditableElement({ targetId, componentKey, elementKey, label, type, fieldType, field, defaultValue, defaultContent, className = "", inline = false, children, }) {
    const resolvedType = (type || fieldType || "text");
    const initialDefault = defaultValue !== undefined ? defaultValue : defaultContent;
    const { getOverride, selectedTargetId, isEditorMode, isPreviewMode, selectElement, componentOverrides } = useEditableContent();
    const effectiveDefault = initialDefault !== undefined ? initialDefault : (typeof children !== "function" ? extractTextFromChildren(children) : undefined);
    const resolvedValue = getOverride(targetId, effectiveDefault);
    const parsed = (0, react_1.useMemo)(() => (0, canonical_target_id_1.parseCanonicalTargetId)(targetId), [targetId]);
    const effectiveComponentKey = componentKey || parsed.componentKey || parsed.sectionKey || "Component";
    const candidateKeys = (0, react_1.useMemo)(() => (0, canonical_target_id_1.getCanonicalLookupKeys)(targetId), [targetId]);
    const hasOverride = (0, react_1.useMemo)(() => {
        if (!componentOverrides)
            return false;
        if (componentOverrides[targetId] !== undefined)
            return true;
        return candidateKeys.some((k) => componentOverrides[k] !== undefined);
    }, [componentOverrides, targetId, candidateKeys]);
    const renderedContent = typeof children === "function"
        ? children(resolvedValue)
        : hasOverride
            ? renderStaticChildWithOverride(children, resolvedValue, resolvedType)
            : children;
    // In public mode or pure preview mode, render child directly without any overlay wrappers
    if (!isEditorMode || isPreviewMode) {
        return react_1.default.createElement(react_1.default.Fragment, null, renderedContent);
    }
    const isSelected = selectedTargetId === targetId;
    const Tag = inline ? "span" : "div";
    const handleClick = (e) => {
        e.stopPropagation();
        const hierarchy = [
            { level: "page", id: parsed.pageSlug || "home", label: (parsed.pageSlug || "home").toUpperCase() },
            { level: "component", id: effectiveComponentKey, label: effectiveComponentKey },
        ];
        if (parsed.itemIndex !== undefined) {
            hierarchy.push({ level: "item", id: `${effectiveComponentKey}.${parsed.itemIndex}`, label: `Item #${parsed.itemIndex + 1}` });
        }
        hierarchy.push({ level: "element", id: targetId, label: label || elementKey || parsed.fieldKey });
        selectElement({
            targetId,
            componentKey: effectiveComponentKey,
            elementKey: elementKey || parsed.fieldKey,
            label: label || elementKey || "Element",
            type: resolvedType,
            value: resolvedValue !== undefined ? resolvedValue : effectiveDefault,
            defaultValue: effectiveDefault,
            editabilityStatus: "FULLY_EDITABLE",
            hierarchy,
        });
    };
    return (react_1.default.createElement(Tag, { onClick: handleClick, "data-editable-id": targetId, "data-editor-target": targetId, "data-editor-component": effectiveComponentKey, "data-editor-element": elementKey || parsed.fieldKey, "data-editor-label": label || elementKey || "Element", "data-editor-type": type, "data-editor-value": typeof resolvedValue === "string" || typeof resolvedValue === "number" ? String(resolvedValue) : (typeof effectiveDefault === "string" ? effectiveDefault : ""), "data-editor-default": typeof effectiveDefault === "string" || typeof effectiveDefault === "number" ? String(effectiveDefault) : "", "data-editor-binding": "VERIFIED_RENDER_BINDING", className: `relative group transition-all duration-150 cursor-pointer ${inline ? "inline-block" : "block"} ${isSelected
            ? "ring-2 ring-rose-500 ring-offset-1 rounded-md z-30 shadow-xs"
            : "hover:outline-dashed hover:outline-2 hover:outline-rose-400/80 hover:ring-2 hover:ring-rose-400/20 rounded-md"} ${className}` },
        isSelected && (react_1.default.createElement("span", { className: "absolute -top-5 left-0 z-40 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono font-bold shadow pointer-events-none whitespace-nowrap" }, label || elementKey || "Selected")),
        renderedContent));
}
exports.EditableElement = EditableElement;
