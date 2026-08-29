"use client";

import React from "react";
import AIStudio from "@/components/ai/AIStudio";

interface Props {
  companyId: string;  
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

export default function AiStudioPageClient({ companyId, initialProduct }: Props) {
  return <AIStudio companyId={companyId} initialProduct={initialProduct} />;
}
