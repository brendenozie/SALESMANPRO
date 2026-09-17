/**
 * lib/search/types.ts
 *
 * Core domain types for universal, multi-tenant search, category discovery,
 * and filtering across Ghuba and SalesmanPro tenant storefronts.
 */

export type SearchScope = "GHUBA" | "STORE";

export type ProductSortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "discount"
  | "popularity"
  | "rating";

export interface CategoryAttributeDefinition {
  key: string;
  label: string;
  type: "select" | "multiselect" | "range" | "boolean";
  options?: Array<{ label: string; value: string }>;
  unit?: string;
  min?: number;
  max?: number;
}

export interface SearchFilterParams {
  // Generic filters
  category?: string[];
  subCategory?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  condition?: string[];
  location?: string;
  sellerId?: string;
  tags?: string[];

  // Category-specific attribute filters (Vehicles, Property, Electronics, Fashion, etc.)
  // Vehicles
  make?: string[];
  model?: string[];
  yearFrom?: number;
  yearTo?: number;
  transmission?: string[];
  fuelType?: string[];
  bodyType?: string[];
  mileageMax?: number;

  // Property
  propertyType?: string[];
  bedrooms?: string[];
  bathrooms?: string[];
  furnishingStatus?: string[];
  rentOrSale?: "SALE" | "RENT" | "ALL";

  // Electronics
  storage?: string[];
  ram?: string[];

  // Fashion
  size?: string[];
  color?: string[];
  material?: string[];
  gender?: string[];

  // Dynamic custom attributes
  customAttributes?: Record<string, any>;
}

export interface SearchQueryParams {
  q?: string;
  scope?: SearchScope;
  companyId?: string;
  storeSlug?: string;
  filters?: SearchFilterParams;
  sort?: ProductSortOption;
  cursor?: string;
  page?: number;
  limit?: number;
  userId?: string;
  visitorId?: string;
}

export interface CompactListingCardDTO {
  id: string;
  name: string;
  description?: string | null;
  images: string[];
  finalPrice: number;
  sellingPrice: number;
  discount?: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  category?: string | null;
  subCategoryName?: string | null;
  productCategoryId?: string | null;
  brand?: string | null;
  model?: string | null;
  condition?: string | null;
  locationName?: string | null;
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    site?: string | null;
  } | null;
  // Category-specific highlights
  make?: string | null;
  year?: number | null;
  transmission?: string | null;
  fuelType?: string | null;
  propertyType?: string | null;
  bedrooms?: any;
  bathrooms?: string | null;
  createdAt?: string | null;
  score?: number;
}

export interface SearchResultMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextCursor?: string;
  hasNextPage: boolean;
  queryTimeMs: number;
  scope: SearchScope;
  appliedFilters: SearchFilterParams;
  sort: ProductSortOption;
  spellingCorrection?: string | null;
}

export interface SearchResponseDTO {
  data: CompactListingCardDTO[];
  meta: SearchResultMeta;
  suggestions?: {
    alternativeQueries?: string[];
    relatedCategories?: Array<{ id: string; name: string; slug: string; count?: number }>;
    similarBrands?: string[];
  };
}

export interface AutocompleteProductSuggestion {
  id: string;
  name: string;
  category?: string | null;
  brand?: string | null;
  price: number;
  image?: string | null;
  companyName?: string | null;
  companySlug?: string | null;
}

export interface AutocompleteCategorySuggestion {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  count?: number;
}

export interface AutocompleteBrandSuggestion {
  name: string;
  count?: number;
}

export interface AutocompleteStoreSuggestion {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface AutocompleteResponseDTO {
  query: string;
  suggestions: string[];
  products: AutocompleteProductSuggestion[];
  categories: AutocompleteCategorySuggestion[];
  brands: AutocompleteBrandSuggestion[];
  stores: AutocompleteStoreSuggestion[];
}

export interface FilterFacetOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterFacetGroup {
  key: string;
  title: string;
  type: "checkbox" | "radio" | "range" | "boolean";
  options?: FilterFacetOption[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface AvailableFiltersResponseDTO {
  categories?: FilterFacetOption[];
  categorySlug?: string;
  categoryName?: string;
  priceRange: { min: number; max: number };
  genericFilters: FilterFacetGroup[];
  categorySpecificFilters: FilterFacetGroup[];
}

export interface SearchTelemetryEvent {
  query: string;
  normalizedQuery: string;
  scope: SearchScope;
  companyId?: string;
  storeSlug?: string;
  resultCount: number;
  filtersApplied: Record<string, any>;
  sort: string;
  userId?: string;
  visitorId?: string;
  sessionId?: string;
  deviceType?: string;
  sourcePage?: string;
  timestamp: Date;
}
