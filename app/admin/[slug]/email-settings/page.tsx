import { cookies } from "next/headers";
import EmailSettingsClient from "./EmailSettingsClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { EmailConfigDTO } from "@/lib/email/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const defaultSettings: EmailConfigDTO = {
  scope: "STORE",
  companyId: "",
  provider: "SMTP",
  fromName: "",
  fromEmail: "",
  replyTo: "",
  host: "",
  port: 587,
  secure: false,
  username: "",
  hasPassword: false,
  hasApiKey: false,
  enabled: true,
  verified: false,
  verificationStatus: "UNVERIFIED",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmailSettingsPage({ params }: PageProps) {
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
  let initialSettings: EmailConfigDTO = {
    ...defaultSettings,
    companyId,
    fromName: company.name,
    fromEmail: company.contactEmail || "",
    replyTo: company.contactEmail || "",
  };

  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/email/settings?companyId=${encodeURIComponent(companyId)}`,
      {
        headers: { cookie: cookieHeader },
        next: { revalidate: 0 },
      }
    );

    if (res.ok) {
      const responseData = await res.json();
      if (responseData.data) {
        initialSettings = {
          ...initialSettings,
          ...responseData.data,
          companyId,
        };
      }
    }
  } catch (err) {
    console.error("[EmailSettingsPage] Failed to fetch settings:", err);
  }

  return (
    <EmailSettingsClient
      slug={slug}
      companyId={companyId}
      companyName={company.name}
      initialSettings={initialSettings}
    />
  );
}
