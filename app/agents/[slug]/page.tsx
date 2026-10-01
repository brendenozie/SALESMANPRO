import { redirect } from "next/navigation";
import { resolveAgentContext } from "@/lib/auth/agentGuard";
import { getDefaultLandingForRole } from "@/lib/features/featureRegistry";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentRootPage({ params }: Props) {
  const { slug } = await params;
  const context = await resolveAgentContext(slug);

  if (!context) {
    redirect(
      "https://auth.salesmanpro.site/signin?callbackUrl=" +
        encodeURIComponent(`https://salesmanpro.site/agents/${slug}/dashboard`)
    );
  }

  const landing = getDefaultLandingForRole(context.category, context.role, slug);
  redirect(landing);
}
