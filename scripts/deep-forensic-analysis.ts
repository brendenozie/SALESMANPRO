import fs from "fs";
import path from "path";
import { TEMPLATE_REGISTRY, getAllTemplates } from "../lib/website-builder/template-registry";
import { getEditableComponent, getAllEditableComponents } from "../lib/website-builder/editable-adapters";

function deepForensicAnalysis() {
  const layoutsDir = path.join(process.cwd(), "components/site/layouts");
  const allTemplates = getAllTemplates();

  console.log("Analyzing theme component architectures and content origins...\n");

  const componentFamilyMap: Record<string, Set<string>> = {
    hero: new Set(),
    commerce_catalog: new Set(),
    service_booking: new Set(),
    features_value_prop: new Set(),
    story_about: new Set(),
    social_proof_testimonials: new Set(),
    media_showcase: new Set(),
    contact_inquiry: new Set(),
    cta_banner: new Set(),
    faq_accordion: new Set(),
    newsletter: new Set(),
    shell_header: new Set(["Header"]),
    shell_footer: new Set(["Footer"]),
    other: new Set(),
  };

  const componentUsageAcrossTemplates: Record<string, string[]> = {};
  const uniqueComponentDefs: Record<string, {
    componentKey: string;
    files: string[];
    hasAdapter: boolean;
    adapterProperties: string[];
    contentOrigins: Set<string>;
    sampleContentPatterns: string[];
  }> = {};

  for (const tpl of allTemplates) {
    for (const sec of tpl.authenticSections) {
      const c = sec.component;
      if (!componentUsageAcrossTemplates[c]) {
        componentUsageAcrossTemplates[c] = [];
      }
      componentUsageAcrossTemplates[c].push(tpl.id);

      // Categorize into family
      const lower = c.toLowerCase();
      if (lower.includes("hero") || lower.includes("banner") && !lower.includes("promo") && !lower.includes("cta")) {
        componentFamilyMap.hero.add(c);
      } else if (lower.includes("product") || lower.includes("catalog") || lower.includes("listing") || lower.includes("dishes") || lower.includes("course") || lower.includes("vehicles") || lower.includes("categories") || lower.includes("category")) {
        componentFamilyMap.commerce_catalog.add(c);
      } else if (lower.includes("service") || lower.includes("booking") || lower.includes("appointment") || lower.includes("doctor") || lower.includes("agent") || lower.includes("pricing")) {
        componentFamilyMap.service_booking.add(c);
      } else if (lower.includes("feature") || lower.includes("excellence") || lower.includes("benefit") || lower.includes("why") || lower.includes("card") || lower.includes("metric") || lower.includes("stat")) {
        componentFamilyMap.features_value_prop.add(c);
      } else if (lower.includes("about") || lower.includes("story") || lower.includes("school") || lower.includes("heritage")) {
        componentFamilyMap.story_about.add(c);
      } else if (lower.includes("testimonial") || lower.includes("review") || lower.includes("award") || lower.includes("trust") || lower.includes("client")) {
        componentFamilyMap.social_proof_testimonials.add(c);
      } else if (lower.includes("video") || lower.includes("tour") || lower.includes("gallery") || lower.includes("media") || lower.includes("showcase")) {
        componentFamilyMap.media_showcase.add(c);
      } else if (lower.includes("contact") || lower.includes("location") || lower.includes("call") || lower.includes("inquiry")) {
        componentFamilyMap.contact_inquiry.add(c);
      } else if (lower.includes("cta") || lower.includes("started") || lower.includes("action") || lower.includes("promo")) {
        componentFamilyMap.cta_banner.add(c);
      } else if (lower.includes("faq") || lower.includes("question") || lower.includes("accordion")) {
        componentFamilyMap.faq_accordion.add(c);
      } else if (lower.includes("newsletter") || lower.includes("subscribe")) {
        componentFamilyMap.newsletter.add(c);
      } else {
        componentFamilyMap.other.add(c);
      }
    }
  }

  // Find source files for components across layouts
  function searchComponentsInDir(dir: string) {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        if (item !== "node_modules" && item !== ".git") {
          searchComponentsInDir(full);
        }
      } else if (item.endsWith(".tsx") || item.endsWith(".jsx")) {
        const basename = path.basename(item, path.extname(item));
        const parentDir = path.basename(path.dirname(full));
        
        const candidateKeys = [basename, parentDir];
        for (const k of candidateKeys) {
          if (componentUsageAcrossTemplates[k]) {
            if (!uniqueComponentDefs[k]) {
              const adapter = getEditableComponent(k);
              uniqueComponentDefs[k] = {
                componentKey: k,
                files: [],
                hasAdapter: !!adapter && adapter.status !== "VIEW_ONLY",
                adapterProperties: adapter ? Object.keys(adapter.properties) : [],
                contentOrigins: new Set(),
                sampleContentPatterns: [],
              };
            }
            uniqueComponentDefs[k].files.push(path.relative(process.cwd(), full));
            
            // Read source to detect content origin
            const code = fs.readFileSync(full, "utf8");
            if (code.includes("store.") || code.includes("storeFormData.") || code.includes("siteData.")) {
              uniqueComponentDefs[k].contentOrigins.add("D. Store/Company Data");
            }
            if (code.includes(".marketplaceListings") || code.includes("products") || code.includes("categories") || code.includes(".destinations")) {
              uniqueComponentDefs[k].contentOrigins.add("E. Product/Category/Listing Data");
            }
            if (code.includes("<h1>") && /<h1>[A-Za-z\s]+<\/h1>/.test(code)) {
              uniqueComponentDefs[k].contentOrigins.add("A. Hardcoded Design Content");
            }
            if (code.includes("const [") || code.includes("const default") || code.includes("const sample")) {
              uniqueComponentDefs[k].contentOrigins.add("B. Component-Local Configuration");
            }
            if (code.includes("getOverride(") || code.includes("componentOverrides")) {
              uniqueComponentDefs[k].contentOrigins.add("G. Component Override");
            }
            if (code.includes("useSWR") || code.includes("fetch(")) {
              uniqueComponentDefs[k].contentOrigins.add("J. External/API Data");
            }
          }
        }
      }
    }
  }

  searchComponentsInDir(layoutsDir);

  const report = {
    totalTemplates: allTemplates.length,
    componentFamilies: Object.fromEntries(
      Object.entries(componentFamilyMap).map(([k, set]) => [k, Array.from(set)])
    ),
    uniqueComponentsCount: Object.keys(componentUsageAcrossTemplates).length,
    components: Object.fromEntries(
      Object.entries(uniqueComponentDefs).map(([k, def]) => [
        k,
        {
          ...def,
          contentOrigins: Array.from(def.contentOrigins),
          usedInTemplatesCount: componentUsageAcrossTemplates[k]?.length || 0,
        },
      ])
    ),
  };

  const outputPath = path.join(process.cwd(), "scratch", "component-architecture-analysis.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Deep analysis written to: ${outputPath}`);

  console.log("\n--- COMPONENT FAMILIES SUMMARY ---");
  for (const [fam, set] of Object.entries(componentFamilyMap)) {
    console.log(`  Family '${fam}': ${set.size} distinct components (${Array.from(set).slice(0, 5).join(", ")}${set.size > 5 ? "..." : ""})`);
  }
}

deepForensicAnalysis();
