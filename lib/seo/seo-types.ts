/**
 * lib/seo/seo-types.ts
 *
 * Authoritative Type Definitions for the Central SEO Engine
 * across SalesmanPro (SaaS), Ghuba (Marketplace), and Tenant Stores.
 */

import type { Metadata } from "next";

export type SiteType = "SALESMANPRO" | "GHUBA" | "TENANT_STORE";

export type PageType =
  | "HOME"
  | "PRODUCT"
  | "CATEGORY"
  | "SERVICE"
  | "LISTING"
  | "SELLER"
  | "BLOG"
  | "ARTICLE"
  | "COURSE"
  | "EVENT"
  | "PROPERTY"
  | "VEHICLE"
  | "BOOK"
  | "ABOUT"
  | "CONTACT"
  | "CAREERS"
  | "PRICING"
  | "TERMS"
  | "PRIVACY"
  | "CUSTOM";

export interface TenantSEOProfile {
  id: string;
  slug: string;
  domain?: string | null;
  name: string;
  description?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  category?: string | null;
  currency?: string | null;
  socialLinks?: Record<string, string> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ListingSEOEntity {
  id: string;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  brand?: string | null;
  model?: string | null;
  make?: string | null;
  trim?: string | null;
  vin?: string | null;
  mileage?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  propertyType?: string | null;
  bedrooms?: any;
  bathrooms?: string | null;
  area?: string | null;
  author?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  serviceSchedule?: string | null;
  finalPrice?: number | null;
  sellingPrice?: number | null;
  discount?: number | null;
  currency?: string | null;
  isAvailable?: boolean;
  quantity?: number;
  condition?: string | null;
  sku?: string | null;
  images?: Array<string | { url: string }>;
  videos?: Array<string | { url: string }>;
  category?: string | null;
  subCategoryName?: string | null;
  updatedAt?: string | Date | null;
  seller?: {
    id: string;
    name: string;
    slug?: string | null;
    logoUrl?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
  } | null;
}

export interface SEOContext {
  siteType: SiteType;
  pageType: PageType;
  tenant?: TenantSEOProfile | null;
  entity?: ListingSEOEntity | Record<string, any> | null;
  requestHost?: string | null;
  currentPath?: string | null;
  breadcrumbs?: BreadcrumbItem[];
  canonicalOverride?: string | null;
  noIndex?: boolean;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  customSEO?: {
    title?: string | null;
    description?: string | null;
    keywords?: string[] | null;
    image?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
  } | null;
}

export interface CanonicalUrlOptions {
  siteType: SiteType;
  path: string;
  tenant?: {
    slug: string;
    domain?: string | null;
  } | null;
  requestHost?: string | null;
  override?: string | null;
}

export interface SEOMetadataResult {
  metadata: Metadata;
  jsonLd: Record<string, any>[];
  canonicalUrl: string;
}

export interface SEOReadinessCheck {
  id: string;
  label: string;
  passed: boolean;
  severity: "CRITICAL" | "RECOMMENDED" | "OPTIONAL";
  fixSuggestion: string;
}

export interface SEOReadinessReport {
  score: number;
  status: "SEO_READY" | "SEO_NEEDS_ATTENTION";
  checks: SEOReadinessCheck[];
  summary: string;
}
