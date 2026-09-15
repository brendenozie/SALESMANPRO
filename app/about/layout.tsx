import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "SALESMANPRO",
  pageType: "ABOUT",
  currentPath: "/about",
}).metadata;

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
