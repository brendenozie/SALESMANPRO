"use client";

import React, { useState } from "react";
import AIStudio from "@/components/ai/AIStudio";
import SchoolAcademicAIStudio from "@/components/ai/SchoolAcademicAIStudio";

interface Props {
  companyId: string;
  slug?: string;
  isEducational?: boolean;
  initialProduct?: {
    productId?: string;
    name?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    category?: string;
    subcategory?: string;
  };
}

export default function AiStudioPageClient({
  companyId,
  slug,
  isEducational = false,
  initialProduct,
}: Props) {
  // If educational, default to academic studio unless user explicitly toggles
  const [studioMode, setStudioMode] = useState<"academic" | "creative">(
    isEducational ? "academic" : "creative"
  );

  if (studioMode === "academic") {
    return (
      <SchoolAcademicAIStudio
        companyId={companyId}
        slug={slug}
        onSwitchToGeneralStudio={() => setStudioMode("creative")}
      />
    );
  }

  return (
    <div>
      {isEducational && (
        <div className="bg-purple-900/10 border-b border-purple-500/20 px-6 py-2.5 flex justify-between items-center text-xs font-bold text-purple-700 dark:text-purple-300">
          <span>Creative & Brand Media Studio Mode</span>
          <button
            onClick={() => setStudioMode("academic")}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold transition"
          >
            ← Back to Academic AI Studio
          </button>
        </div>
      )}
      <AIStudio companyId={companyId} slug={slug} initialProduct={initialProduct} />
    </div>
  );
}
