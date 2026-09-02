"use client";

import React from "react";
import AIStudio from "@/components/ai/AIStudio";

interface Props {
  companyId: string;
  slug?: string;
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

export default function AiStudioPageClient({ companyId, slug, initialProduct }: Props) {
  return <AIStudio companyId={companyId} slug={slug} initialProduct={initialProduct} />;
}
