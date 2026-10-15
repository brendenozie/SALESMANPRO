import { DecodedFeedImage } from "@/components/ghuba/feed/DecodedFeedImage";
import { GhubaFeedItem } from "@/components/ghuba/feed/GhubaFeedItem";
import { GhubaFeedFilter } from "@/components/ghuba/feed/GhubaFeedFilter";
import { GhubaFeedCommerceBar } from "@/components/ghuba/feed/GhubaFeedCommerceBar";
import { GhubaFeedContainer } from "@/components/ghuba/feed/GhubaFeedContainer";
import { storefrontPerformanceConfig } from "@/lib/performance/storefrontConfig";
import { searchService } from "@/lib/search/searchService";

console.log("All imports resolved successfully!");
console.log("Storefront config mobile overscan rows:", storefrontPerformanceConfig.mobile.overscanRows);
console.log("Storefront config desktop overscan rows:", storefrontPerformanceConfig.desktop.overscanRows);
console.log("Storefront config mobile row size:", storefrontPerformanceConfig.mobile.mobileEstimateRowSize);
process.exit(0);
