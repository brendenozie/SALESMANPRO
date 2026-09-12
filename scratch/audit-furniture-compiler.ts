import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";
import { resolveCanonicalTemplate } from "../lib/website-builder/template-registry";

const company = {
  id: "company-furniture-audit",
  name: "Nordic Living Furniture",
  category: "furniture",
  variant: "default",
  slug: "nordic-living",
};

const canonical = resolveCanonicalTemplate(company.category, company.variant);
console.log("Resolved Canonical Template:", canonical.id);

const compiled = compileWebsiteFromCompany(company);
const homePage = compiled.pages.find((p) => p.isHomepage || p.slug === "home");

console.log("Compiled Homepage Sections Count:", homePage?.sections?.length);
console.log("Sections summary:");
homePage?.sections?.forEach((s, idx) => {
  console.log(`[${idx}] id=${s.id} | name=${s.name} | component=${s.component} | type=${s.type} | isVisible=${s.isVisible}`);
});

const uspSection = homePage?.sections?.find((s) => s.component === "USPSlider" || s.id.includes("uspslider"));
console.log("\nExact Core Values (USPSlider) Section Object:");
console.log(JSON.stringify(uspSection, null, 2));
