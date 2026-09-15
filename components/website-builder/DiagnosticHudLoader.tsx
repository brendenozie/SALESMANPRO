"use client";

/**
 * DiagnosticHudLoader.tsx
 *
 * Client-side lazy wrapper for TemplateDiagnosticHud.
 * Must live in a Client Component so that `dynamic({ ssr: false })` is valid.
 * Server Components should import THIS file, not TemplateDiagnosticHud directly.
 */

import dynamic from "next/dynamic";
import type { TemplateDefinition } from "@/types/website-builder";

const TemplateDiagnosticHud = dynamic(
  () => import("@/components/website-builder/TemplateDiagnosticHud"),
  { ssr: false }
);

interface DiagnosticHudLoaderProps {
  slug: string;
  template: TemplateDefinition;
  pageSlug?: string;
  hasPublishedConfig: boolean;
  sectionsCount: number;
  category?: string;
  variant?: string;
}

export default function DiagnosticHudLoader(props: DiagnosticHudLoaderProps) {
  return <TemplateDiagnosticHud {...props} />;
}
