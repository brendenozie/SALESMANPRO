import { Metadata } from "next";
import { SEOService } from "@/lib/seo";

export const metadata: Metadata = SEOService.generate({
  siteType: "GHUBA",
  pageType: "CATEGORY",
  entity: { name: "All Products" },
  currentPath: "/ghuba/productlist",
  breadcrumbs: [
    { name: "Home", url: "/" },
    { name: "Marketplace", url: "/ghuba/productlist" },
  ],
}).metadata;

export default function ProductListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
