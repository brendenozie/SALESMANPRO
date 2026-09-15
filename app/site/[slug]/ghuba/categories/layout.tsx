import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "GHUBA",
  pageType: "CATEGORY",
  currentPath: "/ghuba/categories",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/ghuba/categories" },
  ],
}).metadata;

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
