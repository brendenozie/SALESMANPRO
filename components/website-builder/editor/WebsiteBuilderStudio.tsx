"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CompiledWebsiteConfig,
  SectionType,
  SECTION_REGISTRY,
  ThemeTokens,
} from "@/types/website-builder";
import WebsiteRenderer from "../WebsiteRenderer";
import SectionPickerModal from "./SectionPickerModal";
import AIAssistantModal from "./AIAssistantModal";
import VersionHistoryModal from "./VersionHistoryModal";
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
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface WebsiteBuilderStudioProps {
  initialConfig: CompiledWebsiteConfig;
  storeSlug: string;
  storeName: string;
  companyId: string;
  storeLogoUrl?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: any[];
  initialRevisions?: any[];
}

type ViewportMode = "desktop" | "tablet" | "mobile";
type SidebarTab = "sections" | "pages" | "theme" | "navigation";

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

export default function WebsiteBuilderStudio({
  initialConfig,
  storeSlug,
  storeName,
  companyId,
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
    if (!selectedSectionId && activePage?.sections?.length) {
      setSelectedSectionId(activePage.sections[0].id);
    }
  }, [activePageSlug]);

  // Track edits
  const updateConfig = useCallback((updater: (prev: CompiledWebsiteConfig) => CompiledWebsiteConfig) => {
    setConfig((prev) => {
      const next = updater(JSON.parse(JSON.stringify(prev)));
      setHasUnsavedChanges(true);
      return next;
    });
  }, []);

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
        id: `sec-${original.type}-${Date.now()}`,
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
    <div className="flex flex-col h-screen w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden select-none">
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

        {/* Center: Breakpoint Viewport Switcher */}
        <div className="hidden sm:flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
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

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              isPreviewMode
                ? "bg-zinc-900 text-white border-zinc-900"
                : "text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <EyeIcon className="w-4 h-4" />
            <span className="hidden md:inline">{isPreviewMode ? "Exit Preview" : "Preview"}</span>
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
                    {(activePage?.sections || []).map((sec, idx) => {
                      const isSelected = selectedSectionId === sec.id;
                      const regItem = SECTION_REGISTRY[sec.type as SectionType];

                      return (
                        <div
                          key={sec.id}
                          onClick={() => setSelectedSectionId(sec.id)}
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
                                {regItem?.title || sec.type}
                              </h4>
                              <span className="text-[10px] text-zinc-400 capitalize">
                                {sec.type}
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
            </div>
          </aside>
        )}

        {/* CENTER INTERACTIVE CANVAS */}
        <main className="grow overflow-y-auto bg-zinc-200/70 dark:bg-zinc-950 flex flex-col items-center">
          <div className={`transition-all duration-300 bg-white dark:bg-zinc-900 ${viewportWidthClass}`}>
            <WebsiteRenderer
              config={config}
              pageSlug={activePageSlug}
              companyId={companyId}
              storeLogoUrl={storeLogoUrl}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              address={address}
              socialLinks={socialLinks}
              isEditorPreview={true}
              selectedSectionId={selectedSectionId}
              onSelectSection={(secId) => setSelectedSectionId(secId)}
              onNavigatePage={(slug) => {
                const cleanSlug = slug.replace(/^\//, "") || "home";
                setActivePageSlug(cleanSlug);
                setSelectedSectionId(null);
              }}
            />
          </div>
        </main>

        {/* RIGHT INSPECTOR PANEL (When Section is Selected) */}
        {!isPreviewMode && selectedSection && (
          <aside className="w-80 shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-20 animate-fadeIn">
            {/* Inspector Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Inspector
                </span>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white capitalize">
                  {selectedSection.type} Section
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSectionId(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Inspector Fields */}
            <div className="p-4 overflow-y-auto grow space-y-4 text-xs">
              {/* Common Content Fields */}
              {"title" in (selectedSection.content || {}) && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Title / Headline
                  </label>
                  <input
                    type="text"
                    value={selectedSection.content.title || ""}
                    onChange={(e) => handleUpdateSectionContent("title", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                  />
                </div>
              )}

              {"subtitle" in (selectedSection.content || {}) && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Subtitle / Eyebrow
                  </label>
                  <input
                    type="text"
                    value={selectedSection.content.subtitle || ""}
                    onChange={(e) => handleUpdateSectionContent("subtitle", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                  />
                </div>
              )}

              {"description" in (selectedSection.content || {}) && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Description Body
                  </label>
                  <textarea
                    rows={3}
                    value={selectedSection.content.description || ""}
                    onChange={(e) => handleUpdateSectionContent("description", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs resize-none"
                  />
                </div>
              )}

              {"buttonText" in (selectedSection.content || {}) && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={selectedSection.content.buttonText || ""}
                      onChange={(e) => handleUpdateSectionContent("buttonText", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={selectedSection.content.buttonUrl || ""}
                      onChange={(e) => handleUpdateSectionContent("buttonUrl", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs"
                    />
                  </div>
                </div>
              )}

              {"imageUrl" in (selectedSection.content || {}) && (
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={selectedSection.content.imageUrl || ""}
                    onChange={(e) => handleUpdateSectionContent("imageUrl", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs mb-2"
                  />
                  {selectedSection.content.imageUrl && (
                    <img
                      src={selectedSection.content.imageUrl}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800"
                    />
                  )}
                </div>
              )}

              {/* Data Source Bindings for Commerce */}
              {selectedSection.dataSource && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Authoritative Catalog Source
                  </span>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Product Query Filter
                    </label>
                    <select
                      value={selectedSection.dataSource.filter}
                      onChange={(e) => handleUpdateDataSource("filter", e.target.value)}
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
                      Max Items to Show ({selectedSection.dataSource.limit || 8})
                    </label>
                    <input
                      type="range"
                      min={4}
                      max={24}
                      step={4}
                      value={selectedSection.dataSource.limit || 8}
                      onChange={(e) => handleUpdateDataSource("limit", parseInt(e.target.value, 10))}
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
                      value={selectedSection.styles?.paddingTop || "lg"}
                      onChange={(e) => handleUpdateSectionStyle("paddingTop", e.target.value)}
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
                      value={selectedSection.styles?.paddingBottom || "lg"}
                      onChange={(e) => handleUpdateSectionStyle("paddingBottom", e.target.value)}
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
    </div>
  );
}
