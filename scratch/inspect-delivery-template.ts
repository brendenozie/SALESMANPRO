import { TEMPLATE_REGISTRY } from "../lib/website-builder/template-registry";
import { compileWebsiteFromCompany } from "../lib/website-builder/template-compiler";

const delivery = TEMPLATE_REGISTRY["delivery@v1"];
console.log("=== DELIVERY TEMPLATE DEFINITION ===");
console.log("ID:", delivery?.id);
console.log("Name:", delivery?.name);
console.log("Category:", delivery?.category);
console.log("Shell:", delivery?.shellLayout);
console.log("Body:", delivery?.bodyComponent);
console.log("Authentic Sections Count:", delivery?.authenticSections?.length);

console.log("\n=== AUTHENTIC SECTIONS ===");
delivery?.authenticSections?.forEach((sec, idx) => {
  console.log(`${idx + 1}. ID: ${sec.id} | Component: ${sec.component} | Type: ${sec.type} | Name: ${sec.name}`);
});

console.log("\n=== COMPILED DELIVERY WEBSITE ===");
const company: any = {
  id: "comp-delivery-audit",
  name: "Swift Courier Express",
  category: "delivery",
  store: {
    template: {
      category: "delivery",
      variant: "courier-express-logistics",
    },
  },
};
const website = compileWebsiteFromCompany(company);
console.log("Compiled Pages Count:", website.pages.length);
const home = website.pages.find((p) => p.isHomepage || p.slug === "home");
console.log("Compiled Home Sections:", home?.sections.length);
home?.sections.forEach((s: any, idx: number) => {
  console.log(`${idx + 1}. ID: ${s.id} | Component: ${s.component} | Type: ${s.type} | Name: ${s.name}`);
});
