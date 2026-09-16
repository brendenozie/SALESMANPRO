"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStore = void 0;
const navigation_1 = require("next/navigation");
const react_1 = __importDefault(require("react"));
const company_fetcher_1 = require("@/lib/company-fetcher");
const transformPrismaToStoreForm_1 = require("@/utils/transformPrismaToStoreForm");
const siteBodyComponentMap_1 = require("@/components/site/layouts/siteBodyComponentMap");
const ghuba_fetcher_1 = require("@/lib/ghuba-fetcher");
const ghuba_helpers_1 = require("@/lib/ghuba-helpers");
// Safe per-request memoization helper compatible with React 18 types
const requestCache = (react_1.default.cache || ((fn) => fn));
const template_registry_1 = require("@/lib/website-builder/template-registry");
exports.loadStore = requestCache(async (slug) => {
    const raw = await (0, company_fetcher_1.findCompanyCached)(slug, "page");
    if (!raw)
        (0, navigation_1.notFound)();
    const pageData = (0, transformPrismaToStoreForm_1.transformCompanyToStoreForm)(raw);
    const isGhuba = (0, ghuba_helpers_1.isGhubaMarketplace)(slug, raw);
    const categoryInput = pageData.category || "other";
    const variantInput = pageData.variant || "";
    const category = isGhuba ? "portal" : categoryInput;
    const variant = isGhuba ? "ghuba" : variantInput;
    const canonicalTemplate = isGhuba
        ? (0, template_registry_1.resolveCanonicalTemplate)("portal", "ghuba", "ghuba@v1")
        : (0, template_registry_1.resolveCanonicalTemplate)(raw?.category, raw?.variant, raw?.website?.templateKey);
    const componentName = isGhuba
        ? "GhubaSite"
        : (canonicalTemplate.bodyComponent || (0, siteBodyComponentMap_1.getComponentNameForCategory)(category, variant || ""));
    // Fetch global Ghuba marketplace data instantly from cache if applicable
    let ghubaData = null;
    if (isGhuba) {
        ghubaData = await (0, ghuba_fetcher_1.getGhubaHomepageCached)();
    }
    return { raw, pageData, componentName, ghubaData, canonicalTemplate };
});
