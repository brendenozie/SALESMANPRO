import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "SALESMANPRO",
  pageType: "BLOG",
  currentPath: "/blog",
}).metadata;

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
