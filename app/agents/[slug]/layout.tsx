import React, { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { resolveAgentContext } from "@/lib/auth/agentGuard";
import AgentLayout from "@/components/agent/AgentLayout";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export default async function AgentStoreLayout({ params, children }: Props) {
  const { slug } = await params;
  const context = await resolveAgentContext(slug);

  if (!context) {
    redirect(
      "https://auth.salesmanpro.site/signin?callbackUrl=" +
        encodeURIComponent(`https://salesmanpro.site/agents/${slug}/dashboard`)
    );
  }

  return <AgentLayout context={context}>{children}</AgentLayout>;
}
