import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "SALESMANPRO",
  pageType: "CAREERS",
  currentPath: "/careers",
}).metadata;

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
