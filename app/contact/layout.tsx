import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "SALESMANPRO",
  pageType: "CONTACT",
  currentPath: "/contact",
}).metadata;

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
