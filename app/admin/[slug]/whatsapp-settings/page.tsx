import { cookies } from "next/headers";
import WhatsAppSettingsClient, { WhatsAppUnifiedSettings } from "./WhatsAppSettingsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const defaultSettings: WhatsAppUnifiedSettings = {
  companyId: "",
  environment: "DEVELOPMENT",
  phoneNumberId: "",
  wabaAccountId: "",
  phoneNumber: "",
  displayName: "",
  appId: "",
  appSecret: "",
  accessToken: "",
  webhookVerifyToken: "",

  enableAiAgent: true,
  provider: "OPENAI",
  model: "gpt-4o-mini",
  assistantName: "Store Assistant",
  aiTone: "friendly",
  temperature: 0.7,
  businessDescription: "",
  aiSystemPrompt:
    "You are an assistant answering WhatsApp queries for our store. Assist customers with inquiries, catalog browsing, and store info.",

  canSearchProducts: true,
  canCheckOrders: true,
  canCreateOrders: false,

  humanHandoff: true,
  handoffConfidenceThreshold: 0.6,
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
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#05070A] p-8 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md shadow-sm">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Company configuration not found for identifier:{" "}
            <span className="font-mono text-emerald-500">
              {identifier || "N/A"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const companyId = company.id;
  let initialSettings: WhatsAppUnifiedSettings = {
    ...defaultSettings,
    companyId,
  };

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/whatsapp/settings?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const responseData = await res.json();
      const rawData = responseData.data || responseData;

      if (rawData) {
        const account = rawData.account || rawData;
        const aiConfig = rawData.aiConfig || rawData;

        initialSettings = {
          companyId,
          // Meta API Credentials
          environment: account.environment || rawData.environment || defaultSettings.environment,
          phoneNumberId: account.phoneNumberId || rawData.phoneNumberId || "",
          wabaAccountId: account.wabaAccountId || account.appId || rawData.wabaAccountId || "",
          phoneNumber: account.phoneNumber || rawData.phoneNumber || "",
          displayName: account.displayName || rawData.displayName || "",
          appId: account.appId || rawData.appId || "",
          appSecret: account.appSecret || rawData.appSecret || "",
          accessToken: account.accessToken || rawData.accessToken || "",
          webhookVerifyToken: account.webhookVerifyToken || rawData.webhookVerifyToken || "",

          // AI Persona & LLM Config
          enableAiAgent: aiConfig.enableAiAgent ?? aiConfig.enabled ?? defaultSettings.enableAiAgent,
          provider: aiConfig.provider || defaultSettings.provider,
          model: aiConfig.model || defaultSettings.model,
          assistantName: aiConfig.assistantName || defaultSettings.assistantName,
          aiTone: aiConfig.aiTone || aiConfig.tone || defaultSettings.aiTone,
          temperature: aiConfig.temperature ?? defaultSettings.temperature,
          businessDescription: aiConfig.businessDescription || defaultSettings.businessDescription,
          aiSystemPrompt: aiConfig.aiSystemPrompt || aiConfig.systemPrompt || defaultSettings.aiSystemPrompt,

          // Capabilities & Tooling
          canSearchProducts: aiConfig.canSearchProducts ?? defaultSettings.canSearchProducts,
          canCheckOrders: aiConfig.canCheckOrders ?? defaultSettings.canCheckOrders,
          canCreateOrders: aiConfig.canCreateOrders ?? defaultSettings.canCreateOrders,

          // Safety & Handoff Rules
          humanHandoff: aiConfig.humanHandoff ?? defaultSettings.humanHandoff,
          handoffConfidenceThreshold: aiConfig.handoffConfidenceThreshold ?? defaultSettings.handoffConfidenceThreshold,
          maxAutoRepliesPerUser: aiConfig.maxAutoRepliesPerUser ?? defaultSettings.maxAutoRepliesPerUser,
          autoHandoffKeywords: aiConfig.autoHandoffKeywords || defaultSettings.autoHandoffKeywords,

          // Business Hours Setup
          enableBusinessHours: aiConfig.enableBusinessHours ?? defaultSettings.enableBusinessHours,
          businessHoursStart: aiConfig.businessHoursStart || defaultSettings.businessHoursStart,
          businessHoursEnd: aiConfig.businessHoursEnd || defaultSettings.businessHoursEnd,
          offHoursMessage: aiConfig.offHoursMessage || defaultSettings.offHoursMessage,
        };
      }
    }
  } catch (err) {
    console.error("[WhatsAppSettingsPage] Failed to load settings:", err);
  }

  return (
    <WhatsAppSettingsClient
      initialSettings={initialSettings}
      companyId={companyId}
    />
  );
}