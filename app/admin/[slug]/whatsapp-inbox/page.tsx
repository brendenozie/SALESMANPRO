import { cookies } from "next/headers";
import WhatsAppInboxClient, { Conversation } from "./WhatsAppInboxClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WhatsAppInboxPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-500">Company configuration not found.</div>;
  }

  const companyId = company.id;
  let initialConversations: Conversation[] = [];

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/whatsapp/conversations?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 10 },
      }
    );

    if (res.ok) {
      initialConversations = (await res.json()).data;
    }
  } catch (err) {
    console.error("[WhatsAppInboxPage] Failed to fetch conversations", err);
  }

  return (
    <WhatsAppInboxClient
      initialConversations={initialConversations}
      companyId={companyId}
    />
  );
}