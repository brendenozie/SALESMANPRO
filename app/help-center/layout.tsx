import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "SALESMANPRO",
  pageType: "CUSTOM",
  entity: { name: "Help Center & Documentation" },
  currentPath: "/help-center",
}).metadata;

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
