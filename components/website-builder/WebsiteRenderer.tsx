"use client";

import React from "react";
import { CompiledWebsiteConfig } from "@/types/website-builder";
import { StoreForm } from "@/types/typings";
import AuthenticTemplateRenderer from "./AuthenticTemplateRenderer";

export interface WebsiteRendererProps {
  config: CompiledWebsiteConfig;
  category?: string;
  variant?: string;
  storeFormData?: StoreForm | any;
  paymentMethods?: any[];
  ghubaData?: any;
  pageSlug?: string;
  companyId?: string;
  storeLogoUrl?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  address?: string | null;
  socialLinks?: any[];
  // Editor mode props
  isEditorPreview?: boolean;
  isPreviewMode?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onNavigatePage?: (slug: string) => void;
  // Element-level editing props
  selectedTargetId?: string | null;
  selectedElement?: any;
  onSelectElement?: (info: any) => void;
  onUpdateOverride?: (targetId: string, value: any) => void;
}

/**
 * Universal WebsiteRenderer that delegates to the AuthenticTemplateRenderer
 * to guarantee 100% template fidelity and visual parity between storefront and builder.
 */
export default function WebsiteRenderer(props: WebsiteRendererProps) {
  return <AuthenticTemplateRenderer {...props} />;
}
