import { cookies } from "next/headers";
import WhatsAppSettingsClient, {
  WhatsAppSettings,
} from "./WhatsAppSettingsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const defaultSettings: WhatsAppSettings = {
  phoneNumberId: "",
  wabaAccountId: "",
  accessToken: "",
  webhookVerifyToken: "",
  enableAiAgent: true,
  aiTone: "friendly",
  aiSystemPrompt:
    "You are an assistant answering WhatsApp queries for our store. Assist customers with inquiries, catalog browsing, and store info.",
  maxAutoRepliesPerUser: 10,
  autoHandoffKeywords: "agent, human, support, representative, call me",
  enableBusinessHours: false,
  businessHoursStart: "08:00",
  businessHoursEnd: "17:00",
  offHoursMessage:
    "Thank you for reaching out! We are currently offline. We will reply during normal operating hours.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WhatsAppSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const cookieHeader = (await cookies()).toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-slate-500">Company configuration not found.</div>;
  }

  const companyId = company.id;
  let initialSettings: WhatsAppSettings = defaultSettings;

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/whatsapp/settings?companyId=${encodeURIComponent(
        companyId
      )}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        initialSettings = { ...defaultSettings, ...data.data };
      }
    }
  } catch (err) {
    console.error("[WhatsAppSettingsPage] Failed to load settings", err);
  }

  return (
    <WhatsAppSettingsClient
      initialSettings={initialSettings}
      companyId={companyId}
    />
  );
}