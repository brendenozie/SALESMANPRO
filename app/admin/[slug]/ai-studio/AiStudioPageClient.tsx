"use client";

import React from "react";
import AIStudio from "@/components/ai/AIStudio";

interface Props {
  companyId: string;
}

export default function AiStudioPageClient({ companyId }: Props) {
  return <AIStudio />;
}
